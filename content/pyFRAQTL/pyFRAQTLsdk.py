import os
import json
import time
import random
import urllib.request
import urllib.error
import csv
from dataclasses import dataclass
from typing import Optional, Tuple, List, Dict, Union
from math import gcd
import ssl


# Public SDK metadata
__version__ = "1.0.0"
__description__ = (
    "FRAQTL QFT SDK: REST/SSE order-finding with raw mode, inlined classical post-processing, "
    "preset/CSV loaders, and convenience EGPTSession/EGPT_Shor wrappers."
)

try:
    from eth_account import Account
    from eth_account.messages import encode_defunct
    _HAS_ETH = True
except Exception:
    _HAS_ETH = False

DEFAULT_BASE_URL = os.environ.get('EGPT_BASE_URL', 'http://localhost:8080')
DEFAULT_DEMO_BASE_URL = 'https://fraqtl-demo-dot-descix.uc.r.appspot.com'
DEFAULT_PRESETS_URL = 'https://storage.googleapis.com/descix-assets-public/fraqtl-qft/data/qft-presets.json'
DEFAULT_CHARTED_CSV_URL = 'https://storage.googleapis.com/descix-assets-public/fraqtl-qft/data/qft-testdata.csv'


def _build_ssl_context() -> Optional[ssl.SSLContext]:
    """Build an SSL context using certifi if available, or disable verification when EGPT_SSL_NO_VERIFY=1."""
    try:
        if str(os.environ.get('EGPT_SSL_NO_VERIFY', '0')).strip() == '1':
            return ssl._create_unverified_context()
    except Exception:
        pass
    try:
        import certifi  # type: ignore
        ctx = ssl.create_default_context(cafile=certifi.where())
        return ctx
    except Exception:
        return None

def _http_request(method: str, path: str, data: Optional[dict] = None, headers: Optional[dict] = None, base_url: Optional[str] = None):
    url = (base_url or DEFAULT_BASE_URL).rstrip('/') + path
    body = None
    if data is not None:
        body = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(url, data=body, method=method)
    req.add_header('Content-Type', 'application/json')
    if headers:
        for k, v in headers.items():
            if v is not None:
                req.add_header(k, v)
    try:
        with urllib.request.urlopen(req, timeout=60, context=_build_ssl_context()) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        try:
            err = json.loads(e.read().decode('utf-8'))
        except Exception:
            err = {'error': str(e)}
        raise RuntimeError(f"HTTP {e.code} for {url}: {err}") from None
    except urllib.error.URLError as e:
        raise RuntimeError(f"Failed to reach {url}: {e}") from None

# -----------------------------
# Classical client-side helpers
# -----------------------------

SMALL_PRIMES = [2,3,5,7,11,13,17,19,23,29,31]

# ==============================
# Inlined Local Classical Toolkit
# ==============================

def _mod_pow(base: int, exp: int, mod: int) -> int:
    try:
        return pow(int(base) % int(mod), int(exp), int(mod))
    except Exception:
        # Fallback square-and-multiply
        b = int(base) % int(mod)
        e = int(exp)
        m = int(mod)
        res = 1
        while e > 0:
            if e & 1:
                res = (res * b) % m
            b = (b * b) % m
            e >>= 1
        return res

def _primes_sieve(limit: int) -> List[int]:
    limit = int(limit)
    if limit < 2:
        return []
    sieve = [True] * (limit + 1)
    sieve[0] = sieve[1] = False
    p = 2
    while p * p <= limit:
        if sieve[p]:
            step = p
            start = p * p
            sieve[start:limit + 1:step] = [False] * (((limit - start) // step) + 1)
        p += 1
    return [i for i, v in enumerate(sieve) if v]

_LCM_CACHE: Dict[int, int] = {}
_PRIME_CACHE: Dict[int, List[int]] = {}

def _lcm(a: int, b: int) -> int:
    g = gcd(a, b)
    return (a // g) * b

def _lcm_range_cached(B: int) -> int:
    B = int(B)
    if B in _LCM_CACHE:
        return _LCM_CACHE[B]
    L = 1
    for i in range(2, B + 1):
        L = _lcm(L, i)
    _LCM_CACHE[B] = L
    return L

def _primes_up_to(B: int) -> List[int]:
    B = int(B)
    if B in _PRIME_CACHE:
        return _PRIME_CACHE[B]
    ps = _primes_sieve(B)
    _PRIME_CACHE[B] = ps
    return ps

def _find_order_lcm_smooth(a: int, N: int, B: int, use_cache: bool = True) -> Optional[int]:
    L = _lcm_range_cached(B) if use_cache else (lambda b: (lambda: 1)())
    x = _mod_pow(a, L, N)
    if x != 1 % N:
        return None
    r = L
    for p in _primes_up_to(B):
        while r % p == 0:
            r_try = r // p
            if _mod_pow(a, r_try, N) == 1:
                r = r_try
            else:
                break
    return r

def _pollard_p_minus_1(a: int, N: int, B1: int, B2: Optional[int] = None, use_cache: bool = True) -> Optional[int]:
    a = a % N
    if N <= 1:
        return None
    acc = a
    for p in _primes_up_to(B1):
        pe = p
        while pe * p <= B1:
            pe *= p
        acc = _mod_pow(acc, pe, N)
    g = gcd(acc - 1, N)
    if 1 < g < N:
        return g
    if B2 and B2 > B1:
        for p in _primes_up_to(B2):
            if p > B1:
                acc = _mod_pow(acc, p, N)
                g = gcd(acc - 1, N)
                if 1 < g < N:
                    return g
    return None

def _pollard_p_plus_1(a: int, N: int, B1: int, use_cache: bool = True) -> Optional[int]:
    a = a % N
    if N <= 1:
        return None
    acc = a
    for p in _primes_up_to(B1):
        pe = p
        while pe * p <= B1:
            pe *= p
        acc = _mod_pow(acc, pe, N)
    g = gcd(acc + 1, N)
    if 1 < g < N:
        return g
    return None

def _classical_tail_from_order(N: int, a: int, r: Optional[int]) -> Dict:
    if r is None or r <= 0 or (r % 2) == 1:
        return {'success': False, 'reason': 'no usable order', 'factors': [], 'y_value': None, 'gcd_y_minus_1': None, 'gcd_y_plus_1': None}
    try:
        y = _mod_pow(a, r // 2, N)
    except Exception:
        return {'success': False, 'reason': 'mod_pow failed', 'factors': [], 'y_value': None, 'gcd_y_minus_1': None, 'gcd_y_plus_1': None}
    if y == 1 or y == (N - 1) % N:
        return {'success': False, 'reason': 'trivial y', 'factors': [], 'y_value': y, 'gcd_y_minus_1': None, 'gcd_y_plus_1': None}
    p = gcd(y - 1, N)
    q = gcd(y + 1, N)
    facs = []
    for f in (p, q):
        if 1 < f < N:
            facs.append(int(f))
    if len(facs) == 1:
        other = N // facs[0]
        if 1 < other < N and other != facs[0]:
            facs = [facs[0], int(other)]
    return {'success': bool(facs), 'reason': 'non-trivial gcds' if facs else 'no non-trivial gcd', 'factors': facs, 'y_value': y, 'gcd_y_minus_1': p if p != 0 else None, 'gcd_y_plus_1': q if q != 0 else None}

def _postprocess_order_result_local(raw: Dict, N: int, a: Optional[int], options: Optional[Dict] = None) -> Dict:
    options = options or {}
    B1 = int(options.get('BMax', 2048))
    B2 = int(options.get('B2Max', 8192))
    enable_lcm = bool(options.get('enableLCMOrderRefinement', True))

    post = (raw or {}).get('postproc', {}) if isinstance(raw, dict) else {}
    srv_facs = [int(x) for x in (post.get('factors') or [])]
    if srv_facs:
        return {
            'y': 'a^(r/2) mod N',
            'y_value': post.get('y_value'),
            'gcd_y_minus_1': post.get('gcd_y_minus_1'),
            'gcd_y_plus_1': post.get('gcd_y_plus_1'),
            'factors': srv_facs,
            'success': True,
            'reason': post.get('reason') or 'server',
        }

    og = (raw or {}).get('order_guess', {})
    r_found = og.get('r_found') if isinstance(og, dict) else None
    if r_found is None:
        try:
            r_found = (raw or {}).get('r')
        except Exception:
            r_found = None
    base_used = (raw or {}).get('meta', {}).get('base_used')
    a_eff = int(a) if a is not None else (int(base_used) if base_used not in (None, 'null', '') else 2)
    N_int = int(N)

    def _try_tail(rc: Optional[int]) -> Optional[Dict]:
        t = _classical_tail_from_order(N_int, a_eff, rc)
        if t.get('success'):
            return {
                'y': 'a^(r/2) mod N',
                'y_value': str(t.get('y_value')) if t.get('y_value') is not None else None,
                'gcd_y_minus_1': str(t.get('gcd_y_minus_1')) if t.get('gcd_y_minus_1') is not None else None,
                'gcd_y_plus_1': str(t.get('gcd_y_plus_1')) if t.get('gcd_y_plus_1') is not None else None,
                'factors': [int(x) for x in (t.get('factors') or [])],
                'success': True,
                'reason': 'refinement:plain',
            }
        return None

    def _refine_r_by_smooth_division(rc: int, B: int) -> int:
        if rc <= 0:
            return rc
        rcur = int(rc)
        if rcur % 2 == 1:
            rcur *= 2
        target = 1 % N_int
        for p in _primes_up_to(max(2, int(B))):
            while rcur % p == 0:
                trial = rcur // p
                if _mod_pow(a_eff, trial, N_int) == target:
                    rcur = trial
                else:
                    break
        if rcur % 2 == 1:
            rcur *= 2
        return rcur

    rc0 = int(r_found) if r_found is not None else None
    og_best = og.get('bestR') if isinstance(og, dict) else None
    if og_best is not None and rc0 is None:
        try:
            rc0 = int(og_best)
        except Exception:
            pass

    r_list: List[int] = []
    try:
        cand_list = og.get('rCandidates') if isinstance(og, dict) else None
        if isinstance(cand_list, list):
            for it in cand_list:
                v = it.get('r') if isinstance(it, dict) else it
                try:
                    r_list.append(int(v))
                except Exception:
                    continue
    except Exception:
        pass
    try:
        top_list = (raw or {}).get('rCandidates')
        if isinstance(top_list, list):
            for v in top_list:
                try:
                    r_list.append(int(v))
                except Exception:
                    continue
    except Exception:
        pass

    ordered: List[int] = []
    if isinstance(rc0, int):
        ordered.append(rc0)
    try:
        if og_best is not None:
            bv = int(og_best)
            if bv not in ordered:
                ordered.append(bv)
    except Exception:
        pass
    for v in r_list:
        if v not in ordered:
            ordered.append(v)

    def _even(v: int) -> int:
        return v if (v % 2 == 0) else (v - 1)

    width = int(options.get('rNeighborhoodWidth', 8)) if isinstance(options, dict) else 8
    multPow = int(options.get('rMultPow', 2)) if isinstance(options, dict) else 2

    def build_neighbors(rc: int) -> List[int]:
        cand: set[int] = set()
        base = _even(int(rc))
        def add(v: Optional[int]):
            if v is None:
                return
            vv = int(v)
            if vv > 1 and (vv % 2 == 0):
                cand.add(vv)
        add(base)
        add(base // 2)
        for d in range(2, max(2, 2*width+1), 2):
            add(base + d)
            add(base - d)
        up = base
        for _ in range(multPow):
            up *= 2
            add(up)
        down = base
        for _ in range(multPow):
            down //= 2
            add(down)
        return sorted(cand)

    for rc in ordered:
        for neigh in build_neighbors(rc):
            refined = _refine_r_by_smooth_division(int(neigh), int(options.get('BMax', 2048))) if isinstance(options, dict) else int(neigh)
            got = _try_tail(refined)
            if got:
                return got

    tail = _classical_tail_from_order(N_int, a_eff, rc0)
    if tail.get('success'):
        return {
            'y': 'a^(r/2) mod N',
            'y_value': str(tail.get('y_value')) if tail.get('y_value') is not None else None,
            'gcd_y_minus_1': str(tail.get('gcd_y_minus_1')) if tail.get('gcd_y_minus_1') is not None else None,
            'gcd_y_plus_1': str(tail.get('gcd_y_plus_1')) if tail.get('gcd_y_plus_1') is not None else None,
            'factors': [int(x) for x in (tail.get('factors') or [])],
            'success': True,
            'reason': tail.get('reason'),
        }

    if enable_lcm and B1 and B1 > 1:
        try:
            r_smooth = _find_order_lcm_smooth(a_eff, N_int, B1, use_cache=True)
        except Exception:
            r_smooth = None
        if r_smooth and r_smooth % 2 == 0:
            t2 = _classical_tail_from_order(N_int, a_eff, int(r_smooth))
            if t2.get('success'):
                return {
                    'y': 'a^(r/2) mod N',
                    'y_value': str(t2.get('y_value')) if t2.get('y_value') is not None else None,
                    'gcd_y_minus_1': str(t2.get('gcd_y_minus_1')) if t2.get('gcd_y_minus_1') is not None else None,
                    'gcd_y_plus_1': str(t2.get('gcd_y_plus_1')) if t2.get('gcd_y_plus_1') is not None else None,
                    'factors': [int(x) for x in (t2.get('factors') or [])],
                    'success': True,
                    'reason': 'refinement:lcm',
                }

    try:
        g = _pollard_p_minus_1(a_eff, N_int, B1, B2 if B2 and B2 > B1 else None, use_cache=True)
    except Exception:
        g = None
    if g and 1 < g < N_int:
        other = N_int // g
        if 1 < other < N_int:
            return {
                'y': 'pollard',
                'y_value': None,
                'gcd_y_minus_1': None,
                'gcd_y_plus_1': None,
                'factors': [int(g), int(other)],
                'success': True,
                'reason': 'refinement:p-1',
            }

    try:
        g2 = _pollard_p_plus_1(a_eff, N_int, B1, use_cache=True)
    except Exception:
        g2 = None
    if g2 and 1 < g2 < N_int:
        other = N_int // g2
        if 1 < other < N_int:
            return {
                'y': 'pollard',
                'y_value': None,
                'gcd_y_minus_1': None,
                'gcd_y_plus_1': None,
                'factors': [int(g2), int(other)],
                'success': True,
                'reason': 'refinement:p+1',
            }

    return {
        'y': 'a^(r/2) mod N',
        'y_value': None,
        'gcd_y_minus_1': None,
        'gcd_y_plus_1': None,
        'factors': [],
        'success': False,
        'reason': 'no factors',
    }

def validate_N(n: int) -> Dict:
    if not isinstance(n, int):
        return {'ok': False, 'reason': 'N must be int'}
    if n <= 1:
        return {'ok': False, 'reason': 'N must be > 1'}
    if n % 2 == 0:
        return {'ok': True, 'trivial': True, 'factors': [2, n//2], 'reason': 'even'}
    pp = is_perfect_power(n)
    if pp:
        b, e = pp
        return {'ok': True, 'trivial': True, 'factors': [b, n//b], 'reason': f'perfect_power({e})'}
    if miller_rabin(n):
        return {'ok': True, 'prime': True, 'reason': 'probably prime'}
    return {'ok': True}

def is_perfect_power(n: int) -> Optional[Tuple[int,int]]:
    if n <= 3:
        return None
    max_e = n.bit_length()
    # Use float root heuristic; safe for small exponents
    for e in range(2, max_e+1):
        b = round(n ** (1.0 / e))
        for cand in (b-1, b, b+1):
            if cand > 1 and cand**e == n:
                return (cand, e)
    return None

def miller_rabin(n: int, rounds: int = 8) -> bool:
    if n < 2:
        return False
    for p in SMALL_PRIMES:
        if n % p == 0:
            return n == p
    # write n-1 = d*2^s
    d = n - 1
    s = 0
    while d % 2 == 0:
        d //= 2
        s += 1
    for _ in range(rounds):
        a = random.randrange(2, n - 1)
        x = pow(a, d, n)
        if x == 1 or x == n - 1:
            continue
        for _ in range(s - 1):
            x = (x * x) % n
            if x == n - 1:
                break
        else:
            return False
    return True

def continued_fraction(num: int, den: int) -> List[int]:
    cf = []
    while den:
        a = num // den
        cf.append(a)
        num, den = den, num - a * den
    return cf

def convergents(cf: List[int]) -> List[Tuple[int,int]]:
    if not cf:
        return []
    conv: List[Tuple[int,int]] = []
    p0, p1 = 1, cf[0]
    q0, q1 = 0, 1
    conv.append((p1, q1))
    for a in cf[1:]:
        p2 = a * p1 + p0
        q2 = a * q1 + q0
        conv.append((p2, q2))
        p0, p1 = p1, p2
        q0, q1 = q1, q2
    return conv

def best_rational_approx(phase_num: int, phase_den: int, max_den: int) -> Optional[Tuple[int,int]]:
    cf = continued_fraction(phase_num, phase_den)
    best: Optional[Tuple[int,int]] = None
    for p, q in convergents(cf):
        if q <= max_den:
            best = (p, q)
        else:
            break
    return best

def select_coprime_a(N: int, rng: random.Random) -> Tuple[int, Optional[Tuple[int,int]], Dict]:
    while True:
        a = rng.randrange(2, max(3, N - 1))
        g = gcd(a, N)
        if g > 1:
            return a, (g, N // g), {'reason': 'gcd-short-circuit'}
        if g == 1:
            return a, None, {'reason': 'coprime'}

def divisors(n: int) -> List[int]:
    out = set([1])
    x = 2
    while x * x <= n:
        if n % x == 0:
            out.add(x)
            out.add(n // x)
        x += 1
    return sorted(out)

def is_valid_order(a: int, r: Optional[int], N: int) -> bool:
    if r is None or r <= 0:
        return False
    if pow(a, r, N) != 1:
        return False
    for d in divisors(r):
        if d == r:
            continue
        if pow(a, d, N) == 1:
            return False
    return True

def reconstruct_order_candidates(samples: List[Tuple[int,int]], a: int, N: int, max_den: Optional[int] = None) -> List[int]:
    if not samples:
        return []
    if max_den is None:
        max_den = N
    cands = []
    for s, den in samples:
        s = int(s); den = int(den)
        approx = best_rational_approx(s, den, max_den)
        if approx is None:
            continue
        p, q = approx
        if q > 1:
            cands.append(q)
    uniq: List[int] = []
    for r in sorted(set(cands)):
        uniq.append(r)
    return uniq


@dataclass
class EGPTJobResult:
    result: dict

    def result_dict(self) -> dict:
        return self.result


class EGPTBackend:
    def __init__(self, base_url: Optional[str] = None, wallet_address: Optional[str] = None, signature: Optional[str] = None, config_path: Optional[str] = None, private_key_path: Optional[str] = None):
        self.base_url = base_url or DEFAULT_BASE_URL
        # Resolve credentials from direct args, config file, or private key file
        resolved_addr = wallet_address
        resolved_sig = signature
        if (not resolved_addr or not resolved_sig) and config_path:
            try:
                creds = WalletConfig.from_file(config_path)
                resolved_addr = resolved_addr or creds.wallet_address
                resolved_sig = resolved_sig or creds.signature
            except Exception:
                pass
        if (not resolved_addr or not resolved_sig) and private_key_path:
            try:
                creds = WalletConfig.from_private_key_file(private_key_path)
                resolved_addr = resolved_addr or creds.wallet_address
                resolved_sig = resolved_sig or creds.signature
            except Exception:
                pass
        self.wallet_address = resolved_addr
        self.signature = resolved_sig

    @classmethod
    def from_env(cls):
        return cls(
            base_url=os.environ.get('EGPT_BASE_URL', DEFAULT_BASE_URL),
            wallet_address=os.environ.get('EGPT_WALLET_ADDRESS'),
            signature=os.environ.get('EGPT_SIGNATURE'),
        )

    def _headers(self) -> dict:
        h = {}
        if self.wallet_address:
            h['X-Wallet-Address'] = self.wallet_address
        if self.signature:
            h['X-Signature'] = self.signature
        return h

    @classmethod
    def auto(cls, base_url: Optional[str] = None, config_path: Optional[str] = None, private_key_path: Optional[str] = None):
        """Construct a backend using env if available; otherwise demo defaults.
        Order of precedence for base_url: arg > EGPT_BASE_URL env > DEFAULT_DEMO_BASE_URL.
        Wallet config/signature: direct args/env > provided paths > demo wallet.config near this module if present.
        """
        bu = base_url or os.environ.get('EGPT_BASE_URL') or DEFAULT_DEMO_BASE_URL
        addr = os.environ.get('EGPT_WALLET_ADDRESS')
        sig = os.environ.get('EGPT_SIGNATURE')
        cfg_env = os.environ.get('EGPT_WALLET_CONFIG')
        pk_env = os.environ.get('EGPT_PRIVATE_KEY_PATH')
        cfg = config_path or cfg_env
        pkp = private_key_path or pk_env
        # Fallback demo wallet.config in the package directory
        if not addr or not sig:
            if not cfg and '__file__' in globals():
                try:
                    demo_path = os.path.join(os.path.dirname(__file__), 'demo.wallet.config')
                    if os.path.isfile(demo_path):
                        cfg = demo_path
                except Exception:
                    pass
        return cls(base_url=bu, wallet_address=addr, signature=sig, config_path=cfg, private_key_path=pkp)

    def health(self) -> dict:
        try:
            return _http_request('GET', '/health', None, headers=self._headers(), base_url=self.base_url)
        except Exception as e:
            return {'ok': False, 'error': str(e)}

    def stream_order_find(self, N: str, a: Optional[str] = None, options: Optional[dict] = None, on_event: Optional[callable] = None, timeout: int = 180, raw: bool = False):
        """
        Connects to the server's SSE endpoint and yields events. If on_event is provided,
        it is called with the parsed event dict for each message; otherwise yields events as an iterator.
        """
        import urllib.parse
        params = {'N': str(N)}
        if a is not None:
            params['a'] = str(a)
        opts = options or {}
        if 'preset' in opts:
            params['preset'] = opts['preset']
        if opts.get('quantumSweep'):
            params['quantumSweep'] = '1'
        if raw:
            params['raw'] = '1'
        # Common shorthand knobs
        for k_src, k_dst in [
            ('timeBudgetMs', 'time'), ('baseCount', 'baseCount'), ('baseMax', 'baseMax'),
            ('rNeighborhoodWidth', 'rwidth'), ('rMultPow', 'rmult'), ('BMax', 'B'), ('B2Max', 'B2'),
        ]:
            if k_src in opts:
                params[k_dst] = str(opts[k_src])
        params['options'] = json.dumps(opts)
        qs = urllib.parse.urlencode(params)
        url = self.base_url.rstrip('/') + '/api/egpt/order-find/stream?' + qs
        req = urllib.request.Request(url, method='GET')
        # Attach headers if we have token gating creds
        for k, v in self._headers().items():
            if v is not None:
                req.add_header(k, v)
        def _iter_events():
            with urllib.request.urlopen(req, timeout=timeout, context=_build_ssl_context()) as resp:
                for raw in resp:
                    try:
                        line = raw.decode('utf-8').strip()
                    except Exception:
                        continue
                    if not line or not line.startswith('data: '):
                        continue
                    payload = line[6:]
                    try:
                        ev = json.loads(payload)
                    except Exception:
                        continue
                    yield ev
        if on_event is None:
            return _iter_events()
        else:
            for ev in _iter_events():
                try:
                    on_event(ev)
                except Exception:
                    pass
            return None

    def stream_collect(self, N: Union[int, str], a: Optional[Union[int, str]] = None, options: Optional[dict] = None, timeout: int = 180, raw: bool = False) -> dict:
        """Collect SSE events into a structured summary and return when stream completes."""
        summary = {
            'ok': False,
            'input': None,
            'last_order_guess': None,
            'last_postproc': None,
            'timing_ms': None,
            'events': [],
            'error': None,
        }
        def _on(ev: dict):
            t = ev.get('type')
            summary['events'].append(ev)
            if t == 'start':
                summary['input'] = ev.get('input')
            elif t == 'order_guess':
                summary['last_order_guess'] = ev.get('order_guess')
            elif t == 'postproc':
                summary['last_postproc'] = ev.get('postproc')
            elif t == 'timing':
                summary['timing_ms'] = ev.get('timing_ms')
            elif t == 'complete':
                summary['ok'] = bool(ev.get('ok'))
            elif t == 'error':
                summary['error'] = ev.get('message')
        self.stream_order_find(str(N), a=str(a) if a is not None else None, options=options, on_event=_on, timeout=timeout, raw=raw)
        return summary

    # High-level factorization job (synchronous call)
    def run_factorization_job(self, k: Union[int, str], a: Optional[Union[int, str]] = None, options: Optional[dict] = None) -> EGPTJobResult:
        payload = {
            'N': str(k),
            'a': str(a) if a is not None else None,
            'options': options or {},
        }
        # Remove None values for cleanliness
        payload = {k: v for k, v in payload.items() if v is not None}
        out = _http_request('POST', '/api/egpt/order-find', payload, headers=self._headers(), base_url=self.base_url)
            # Standardize to a minimal dict for ShorResult builder
        factors = out.get('postproc', {}).get('factors') or []
        return EGPTJobResult({'factors': factors, 'raw': out})

    # Order-finding job (synchronous)
    def run_order_finding_job(self, a: Union[int, str], k: Union[int, str], options: Optional[dict] = None) -> EGPTJobResult:
        payload = {
            'N': str(k),
            'a': str(a),
            'options': options or {},
        }
        # Prefer RAW endpoint to avoid server post-processing payloads
        try:
            out = _http_request('POST', '/api/egpt/order-find/raw', payload, headers=self._headers(), base_url=self.base_url)
        except Exception:
            # Fallback to full endpoint if raw is not available on the server
            out = _http_request('POST', '/api/egpt/order-find', payload, headers=self._headers(), base_url=self.base_url)
        order_guess = out.get('order_guess', {})
        r_found = order_guess.get('r_found')
        return EGPTJobResult({'a': str(a), 'k': str(k), 'order': r_found, 'raw': out})


# Optional Qiskit-like wrappers
class EGPT_Shor:
    def __init__(self, backend: EGPTBackend):
        self._backend = backend

    def factor(self, k: int, a: int = 2):
        """Factor k using backend order-finding for r and performing ALL classical
        post-processing locally to avoid depending on server-side postproc."""
        out = self.factor_via_order_finding(N=int(k), bases=[int(a)])
        class _R:
            pass
        r = _R()
        facs = out.get('factors') or []
        r.factors = [facs] if facs else []
        r.successful = bool(facs)
        r.raw_result = out
        return r

    # Client-side classical tail: derive non-trivial factors from order r
    @staticmethod
    def classical_factors_from_order(N: int, a: int, r: Optional[int]):
        if not r or r % 2 == 1:
            return []
        try:
            x = pow(a, r // 2, N)
        except Exception:
            return []
        if x == 1 or x == (N - 1) % N:
            return []
        p = gcd(x - 1, N)
        q = gcd(x + 1, N)
        out = []
        for f in (p, q):
            if 1 < f < N:
                out.append(int(f))
        # Deduplicate while preserving order
        uniq = []
        for f in out:
            if f not in uniq:
                uniq.append(f)
        return uniq

    def factor_via_order_finding(self, N: int, bases: Optional[list[int]] = None, options: Optional[dict] = None, max_retries: int = 32, time_budget_ms: Optional[int] = None, stop_on_first: bool = True, verbose: bool = False):
        """
        Try to factor N by querying the backend for order-finding on a sequence of bases 'a',
        then perform the classical GCD tail client-side. Returns a dict with trials and any factors found.
        """
        t0 = time.time()
        if bases is None:
            # Generate base candidates from preset options when available
            opts = options or {}
            baseMax = int(opts.get('baseMax', 0) or 0)
            baseCount = int(opts.get('baseCount', 0) or 0)
            cand: list[int] = []
            bases_source: list[str] = []
            if baseMax > 0 and baseCount > 0:
                try:
                    primes = _primes_sieve(max(1000, baseMax))
                    window = [p for p in primes if 2 <= p < baseMax and gcd(p, N) == 1]
                    # Prefer high primes near baseMax to mirror web preset behavior
                    window.sort()
                    tail = window[-(baseCount or len(window)):] if window else []
                    # Mix in a few small coprimes for diversity
                    head = window[: min(16, len(window))]
                    cand = list(dict.fromkeys(list(reversed(tail)) + head))[: baseCount or len(window)]
                    if cand:
                        bases_source.append('presets:primes')
                except Exception:
                    cand = []
            if not cand:
                # Fallback: small coprime integers and a few randoms
                bases_source.append('fallback:coprime_range')
                cand = [x for x in range(2, 64) if gcd(x, N) == 1]
                pool = [x for x in range(64, 512) if gcd(x, N) == 1]
                if len(pool) > 0:
                    extra_k = min(32, len(pool))
                    extra = random.sample(pool, k=extra_k)
                    cand.extend(extra)
            if not cand:
                bases_source.append('fallback:deterministic_small')
                cand = [a for a in (3,5,7,11,13,17,19,23,29,31) if gcd(a, N) == 1]
            # Preserve order to keep preference for high primes near baseMax
            bases = list(dict.fromkeys(cand))[: baseCount or len(cand)]
        trials: List[Dict] = []
        found: List[int] = []
        tries = 0
        for a in bases:
            if a % N == 0:
                continue
            if gcd(a, N) != 1:
                # Trivial factor found without QFT
                g = gcd(a, N)
                if 1 < g < N:
                    found = [int(g), int(N // g)]
                    trials.append({'a': int(a), 'order': None, 'method': 'gcd-precheck', 'factors': found})
                    break
                continue
            # Try both modes unless one is explicitly specified
            modes = []
            if options and isinstance(options, dict) and options.get('mode'):
                modes = [options.get('mode')]
            else:
                modes = ['bitlength', 'log2']
            for mode in modes:
                if max_retries and tries >= max_retries:
                    break
                if time_budget_ms is not None:
                    elapsed_ms = (time.time() - t0) * 1000.0
                    if elapsed_ms >= time_budget_ms:
                        break
                tries += 1
                try:
                    # Forward per-attempt mode in options to mirror EGPTdsp UI flow
                    opt_this = dict(options or {})
                    opt_this['mode'] = mode
                    job = self._backend.run_order_finding_job(a=a, k=N, options=opt_this)
                    raw = job.result.get('raw', {}) or {}

                    r = job.result.get('order')
                    loc: Dict = {'a': int(a), 'order': int(r) if r is not None else None, 'method': f'order-find:{mode}'}

                    # Classical GCD tail from r (client-side)
                    facs = EGPT_Shor.classical_factors_from_order(int(N), int(a), int(r) if r is not None else None)
                    if facs:
                        if len(facs) == 1:
                            f = facs[0]
                            if f != 0:
                                other = int(N) // int(f)
                                if 1 < other < N and other != f:
                                    facs = [int(f), int(other)]
                        loc['factors'] = [int(x) for x in facs]
                        trials.append(loc)
                        found = facs
                        break
                    else:
                        # Local post-processing with parity refinements
                        if isinstance(raw, dict):
                            try:
                                local = _postprocess_order_result_local(raw, int(N), int(a), options=opt_this)
                                if local.get('success') and local.get('factors'):
                                    lf = [int(x) for x in local.get('factors')]
                                    loc['factors'] = lf
                                    loc['method'] = f'local-postproc:{mode}'
                                    trials.append(loc)
                                    found = lf
                                    break
                                else:
                                    trials.append(loc)
                            except Exception:
                                trials.append(loc)
                        else:
                            trials.append(loc)
                except Exception as e:
                    trials.append({'a': int(a), 'error': str(e), 'method': f'order-find:{mode}'})
            if found and stop_on_first:
                break
        # Normalize result
        result = {
            'N': int(N),
            'successful': bool(found),
            'factors': [int(x) for x in found] if found else [],
            'trials': trials,
            'elapsed_ms': round((time.time() - t0) * 1000.0, 3),
            'num_bases_considered': len(bases or []),
        }
        return result

    def factor_batch(self, numbers: list[int], options: Optional[dict] = None, per_number_retries: int = 32) -> list[dict]:
        out = []
        for N in numbers:
            res = self.factor_via_order_finding(N=int(N), options=options or {}, max_retries=per_number_retries)
            out.append(res)
        return out


class EGPT_OrderFinder:
    def __init__(self, backend: EGPTBackend):
        self._backend = backend

    def find_order(self, a: int, k: int):
        job = self._backend.run_order_finding_job(a=a, k=k)
        return job.result


class WalletConfig:
    """
    Utility to manage Polygon/Ethereum-style credentials for the FRAQTLServer token gate.
    - Derives wallet_address from a private key
    - Signs the address string with the private key to produce a signature compatible with ethers.verifyMessage(address, signature)
    - Loads/saves a local wallet.config JSON file
    """
    def __init__(self, wallet_address: str, signature: str):
        self.wallet_address = wallet_address
        self.signature = signature

    @staticmethod
    def _normalize_hex_privkey(raw: str) -> str:
        s = raw.strip()
        if s.startswith('0x') or s.startswith('0X'):
            return s
        # allow files containing only the hex without 0x
        return '0x' + s

    @classmethod
    def from_private_key(cls, private_key_hex: str) -> 'WalletConfig':
        if not _HAS_ETH:
            raise RuntimeError('eth-account is required: pip install eth-account')
        key = cls._normalize_hex_privkey(private_key_hex)
        acct = Account.from_key(key)
        addr = acct.address
        # Sign the address string itself (server verifies signature by recovering and comparing to address)
        msg = encode_defunct(text=addr)
        sig = Account.sign_message(msg, private_key=key).signature.hex()
        return cls(wallet_address=addr, signature=sig)

    @classmethod
    def from_private_key_file(cls, path: str) -> 'WalletConfig':
        with open(path, 'r', encoding='utf-8') as f:
            raw = f.read()
        return cls.from_private_key(raw)

    @classmethod
    def from_file(cls, path: str) -> 'WalletConfig':
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        addr = data.get('wallet_address') or data.get('address')
        sig = data.get('signature')
        if not addr or not sig:
            raise ValueError('wallet.config missing wallet_address or signature')
        return cls(wallet_address=addr, signature=sig)

    def to_dict(self) -> dict:
        return {'wallet_address': self.wallet_address, 'signature': self.signature}

    def save(self, path: str) -> None:
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(self.to_dict(), f, indent=2)


# -----------------------------
# Presets, parsing, demo runner
# -----------------------------

def parse_preset_string(preset_str: str) -> dict:
    opts: Dict[str, object] = {}
    if not preset_str:
        return opts
    for raw in preset_str.split(';'):
        tok = raw.strip()
        if not tok:
            continue
        low = tok.lower()
        if low in ('qs', 'quantum', 'quantumsweep'):
            opts['quantumSweep'] = True
            continue
        if '=' in tok:
            k, v = tok.split('=', 1)
            k = k.strip(); v = v.strip()
            keymap = {
                'time': 'timeBudgetMs', 'timebudgetms': 'timeBudgetMs',
                'basecount': 'baseCount', 'basemax': 'baseMax',
                'rwidth': 'rNeighborhoodWidth', 'rmult': 'rMultPow',
                'b': 'BMax', 'bmax': 'BMax', 'b2': 'B2Max', 'b2max': 'B2Max',
                'preset': 'preset', 'mode': 'mode'
            }
            kk = keymap.get(k.lower(), k)
            if kk in ('preset', 'mode'):
                opts[kk] = v
            else:
                try:
                    opts[kk] = int(v)
                except ValueError:
                    try:
                        opts[kk] = float(v)
                    except ValueError:
                        opts[kk] = v
    return opts


class EGPTPresets:
    @staticmethod
    def load_preset_map(url: str | None = None) -> Dict[str, str]:
        u = url or DEFAULT_PRESETS_URL
        with urllib.request.urlopen(u, timeout=15, context=_build_ssl_context()) as resp:
            return json.loads(resp.read().decode('utf-8'))

    @staticmethod
    def load_charted_csv(url: str | None = None) -> List[Dict]:
        u = url or DEFAULT_CHARTED_CSV_URL
        out: List[Dict] = []
        with urllib.request.urlopen(u, timeout=30, context=_build_ssl_context()) as resp:
            text = resp.read().decode('utf-8').splitlines()
        reader = csv.DictReader(text)
        for row in reader:
            k = str(row.get('H_k_Canonical') or row.get('k') or '').strip()
            if not k:
                continue
            is_prime = (str(row.get('isPrime') or '').strip().lower() == 'true')
            out.append({
                'k': k,
                'isPrime': is_prime,
                'p': (row.get('SmallerFactor') or '').strip() or None,
                'q': (row.get('LargerFactor') or '').strip() or None,
                'presets': (row.get('Presets') or '').strip() or None,
            })
        return out

    @staticmethod
    def load_from_cloud(presets_url: str | None = None, csv_url: str | None = None) -> Tuple[Dict[str, str], List[Dict]]:
        return (
            EGPTPresets.load_preset_map(presets_url),
            EGPTPresets.load_charted_csv(csv_url),
        )


class EGPTQFTRunner:
    def __init__(self, backend: EGPTBackend, preset_map: Dict[str, str], charted_rows: List[Dict]):
        self.backend = backend
        self.preset_map = preset_map or {}
        self.charted = charted_rows or []
        self._sdk = EGPT_Shor(backend)

    def _row_for(self, N_str: str) -> Optional[Dict]:
        for r in self.charted:
            if r.get('k') == N_str:
                return r
        return None

    def _options_for(self, N_str: str) -> Dict:
        row = self._row_for(N_str)
        preset_str = (row.get('presets') if row else None) or self.preset_map.get(N_str) or ''
        opts = parse_preset_string(preset_str)
        if int(N_str) > 1_000_000:
            opts.setdefault('preset', 'hiBits')
        return opts

    def run_server(self, N_str: str) -> Dict:
        opts = self._options_for(N_str)
        job = self.backend.run_factorization_job(k=int(N_str), a=None, options=opts)
        raw = job.result.get('raw', {}) or {}
        post = raw.get('postproc', {}) if isinstance(raw, dict) else {}
        facs = [int(x) for x in (post.get('factors') or [])]
        elapsed = (raw.get('timing_ms', {}) or {}).get('total')
        reason = post.get('reason')
        return {
            'N': N_str,
            'preset': self.preset_map.get(N_str) or (self._row_for(N_str) or {}).get('presets') or '(none)',
            'options': opts,
            'factors': facs,
            'successful': bool(facs),
            'elapsed_ms': elapsed,
            'post_reason': reason,
            'raw': raw,
        }

    def run_sdk(self, N_str: str) -> Dict:
        opts = self._options_for(N_str)
        # Honor preset baseCount by allowing roughly two modes per base
        base_count = int(opts.get('baseCount', 128) or 128)
        max_retries = max(64, base_count * 2)
        res = self._sdk.factor_via_order_finding(
            N=int(N_str),
            options=opts,
            max_retries=max_retries,
            time_budget_ms=None,  # rely on per-base server timeBudgetMs; don't cut off the whole loop prematurely
            stop_on_first=True,
        )
        facs = res.get('factors') or []
        return {
            'N': N_str,
            'preset': self.preset_map.get(N_str) or (self._row_for(N_str) or {}).get('presets') or '(none)',
            'options': opts,
            'factors': facs,
            'successful': res.get('successful'),
            'elapsed_ms': res.get('elapsed_ms'),
            'trials': res.get('trials'),
            'num_bases_considered': res.get('num_bases_considered'),
        }

    def run_sdk_charted(self, mode: str = 'all', limit: Optional[int] = None) -> List[Dict]:
        rows = self.charted or []
        out: List[Dict] = []
        if not rows:
            return out
        def _is_prime(row: Dict) -> bool:
            val = row.get('isPrime')
            if isinstance(val, bool):
                return val
            return bool(val)
        if mode == 'composites':
            sel = [r for r in rows if not _is_prime(r)]
        elif mode == 'primes':
            sel = [r for r in rows if _is_prime(r)]
        else:
            sel = list(rows)
        if limit is not None and isinstance(limit, int) and limit > 0:
            sel = sel[:limit]
        for r in sel:
            N_str = str(r.get('k'))
            out.append(self.run_sdk(N_str))
        return out

    @staticmethod
    def format_result(res: Dict) -> str:
        parts = [
            f"N = {res.get('N')}",
            f"preset = {res.get('preset')}",
            f"options = {res.get('options')}",
            f"factors = {res.get('factors')}",
            f"successful = {res.get('successful')} | elapsed_ms = {res.get('elapsed_ms')}",
        ]
        if 'post_reason' in res and res.get('post_reason') is not None:
            parts.append(f"post_reason = {res.get('post_reason')}")
        return "\n".join(parts)

    @staticmethod
    def print_result(res: Dict) -> None:
        print(EGPTQFTRunner.format_result(res))

    @staticmethod
    def write_csv(results: List[Dict], path: str) -> None:
        cols = ['N', 'preset', 'successful', 'elapsed_ms', 'factors']
        with open(path, 'w', newline='', encoding='utf-8') as f:
            w = csv.DictWriter(f, fieldnames=cols)
            w.writeheader()
            for r in results:
                row = {k: r.get(k) for k in cols}
                w.writerow(row)


# -----------------------------
# High-level one-liner session
# -----------------------------

class EGPTSession:
    """
    Convenience facade that encapsulates:
      - Backend selection (env/demo) with optional wallet config
      - Preset/CSV loading (defaults to public cloud locations)
      - Ready-to-use QFT runner

    Typical use:
        from pyFRAQTLsdk import EGPTSession
        egpt = EGPTSession.auto()
        res = egpt.run('549755813701')
        egpt.show(res)
    """
    def __init__(self, backend: EGPTBackend, preset_map: Dict[str, str], charted_rows: List[Dict]):
        self.backend = backend
        self.preset_map = preset_map or {}
        self.charted = charted_rows or []
        self.runner = EGPTQFTRunner(backend, self.preset_map, self.charted)
        # Expose SDK metadata and basic capability flags
        class _Info:
            def __init__(self, session: 'EGPTSession'):
                self.version = __version__
                self.description = __description__
                self.capabilities = {
                    'stream_collect': bool(callable(getattr(session, 'stream_collect', None))),
                    'sse_backend': bool(callable(getattr(session.backend, 'stream_order_find', None))),
                    'raw_endpoint': True,  # preferred path in this SDK
                    'local_classical': True,
                }
        self.fraqtl_sdk = _Info(self)

    @classmethod
    def auto(
        cls,
    base_url: Optional[str] = None,
    presets_url: Optional[str] = None,
    charted_csv_url: Optional[str] = None,
    wallet_address: Optional[str] = None,
    signature: Optional[str] = None,
    config_path: Optional[str] = None,
    private_key_path: Optional[str] = None,
    ) -> 'EGPTSession':
        # Resolve base URL with demo fallback
        bu = base_url or os.environ.get('EGPT_BASE_URL') or DEFAULT_DEMO_BASE_URL
        # Build backend using env/demo and optional wallet inputs
        backend = EGPTBackend.auto(base_url=bu, config_path=config_path, private_key_path=private_key_path)
        if wallet_address and not backend.wallet_address:
            backend.wallet_address = wallet_address
        if signature and not backend.signature:
            backend.signature = signature
        # Load presets/CSV from cloud (or provided URLs)
        pm, ch = EGPTPresets.load_from_cloud(presets_url, charted_csv_url)
        return cls(backend, pm, ch)

    # Convenience pass-throughs
    def health(self) -> dict:
        return self.backend.health()

    def run(self, N: Union[int, str]) -> Dict:
        return self.runner.run_server(str(N))

    def run_sdk(self, N: Union[int, str]) -> Dict:
        return self.runner.run_sdk(str(N))

    def run_charted_sdk(self, mode: str = 'all', limit: Optional[int] = None) -> List[Dict]:
        return self.runner.run_sdk_charted(mode=mode, limit=limit)

    def show(self, res: Dict) -> None:
        print(self.runner.format_result(res))

    def stream(self, N: Union[int, str], a: Optional[Union[int, str]] = None, options: Optional[dict] = None, on_event: Optional[callable] = None, timeout: int = 180, raw: bool = False):
        return self.backend.stream_order_find(str(N), a=str(a) if a is not None else None, options=options, on_event=on_event, timeout=timeout, raw=raw)

    def stream_collect(self, N: Union[int, str], a: Optional[Union[int, str]] = None, options: Optional[dict] = None, timeout: int = 180, raw: bool = False) -> Dict:
        return self.backend.stream_collect(N, a=a, options=options, timeout=timeout, raw=raw)

    def write_csv(self, results: List[Dict], path: str) -> None:
        EGPTQFTRunner.write_csv(results, path)
