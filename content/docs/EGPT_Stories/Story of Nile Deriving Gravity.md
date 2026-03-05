**The Story of the Summer Project**
The derivation of gravity from discrete cellular automata originated from Essam Abadir's belief that if his discrete mathematical approach—inherited from Stanislaw Ulam, John von Neumann, and Gian-Carlo Rota—was truly universal, it should be straightforward to derive the fundamental laws of physics without using continuous calculus. To test this theory, Essam recruited his son, Nile Abadir, to work for him doing "computer simulations" during the summer of 2024. 

At the time, Nile had just finished his sophomore year as a Cognitive Science undergraduate at Northwestern University and possessed no particular background in either physics or computer science. Essam taught his son the concepts of cellular automata and Gian-Carlo Rota's Entropy Theorem (RET). As a final project for the summer, **Essam gave Nile just two weeks to build a simulation that derived the inverse-square laws from cellular automata in the style of Ulam’s particle Monte Carlo, and to write up the results based on Rota's mathematics**. Nile successfully accomplished exactly that.

**The Theoretical Backup: Rota's Entropy Mathematics**
Nile’s paper, *"Emergent Inverse-Square Laws from Cellular Automata,"* is grounded in the Electronic Graph Paper Theory (EGPT) and relies centrally on Rota’s Entropy Theorem (RET). RET establishes that Shannon entropy is the unique, canonical measure of information for any physically reasonable system. **This theorem provided Nile with the crucial formal justification to reinterpret a physical "force" not as a mystical pulling action, but as a measure of the informational content (entropy) of a system's underlying probability distribution**. By equating the strength of an interaction with the entropy of the probability distribution it defines, the inverse-square form becomes a necessary consequence of the geometry of random walks.

**The Simulation Model**
Nile programmed a formal 2D cellular automata simulation using the p5.js JavaScript library. The "universe" was modeled as a finite square grid of integer coordinates ($C \times C$), representing discrete space. Within this grid, Nile placed two distinct swarms of indistinguishable particles, labeled $S1$ and $S2$. 

*   **Mass as Area:** The number of particles in each swarm ($m1$ and $m2$) represented the "mass" of the objects, acting as a direct measure of how much state-space area a swarm occupied.
*   **Distance:** The swarms were initially separated by a characteristic distance $r$, with the total grid dimension defined as $C = 2r$.
*   **Dynamics:** The system evolved in discrete time ticks, with every particle performing an independent, parallel random walk by moving to an adjacent cell.

**Deriving the Gravitational Equation**
Nile defined a gravitational "interaction" simply as a collision or proximity event—specifically, the probability that a particle from swarm $S1$ and a particle from swarm $S2$ end up targeting the same cell at the final time step. The derivation follows these steps:
1.  The total number of available states (cells) in the system is $C^2$.
2.  The probability of finding any specific particle at any specific cell after diffusion is $1/C^2$.
3.  The probabilistic density of the entire swarm $S1$ occupying a given cell is its particle count multiplied by this probability: $m1/C^2$.
4.  For a single particle in swarm $S2$, the probability it collides with swarm $S1$ is exactly $S1$'s density: $m1/C^2$.
5.  The total probability of an interaction is the sum of these probabilities for all $m2$ particles in swarm $S2$, yielding: $P(\text{interaction}) = m2 \times (m1 / C^2) = (m1 \times m2) / C^2$.
6.  Substituting the characteristic distance $C = 2r$ into the formula, Nile arrived at the exact analytical result: **$P(\text{interaction}) = (m1 \times m2) / 4r^2$**.

Because Rota's theorem establishes that any macroscopic force is bijectively equivalent to the entropy (which is proportional to probability) of its underlying distribution, **the emergent force from this system must take the form $F \propto (m1 \times m2) / r^2$, matching Newton’s Law of Universal Gravitation perfectly**. 

**Extending to Coulomb's Law**
Nile then extended the model to derive Coulomb's Law of electrostatics by introducing a binary "charge" property ($+1$ or $-1$) and enforcing a strict single-occupancy constraint, analogous to the Pauli Exclusion Principle. 
*   **Attraction:** For oppositely charged swarms, attraction was modeled as a direct collision event, yielding the exact same probability: $P \propto (q1 \times q2) / r^2$.
*   **Repulsion:** For like-charged swarms, repulsion was defined as an event of "frustrated movement," where particles from $S1$ and $S2$ attempt to move to the same empty cell simultaneously and interfere with each other's free evolution. Factoring in the probability of moving to a specific adjacent cell ($1/4$), the total probability of a frustrated move event also yielded $P \propto (q1 \times q2) / r^2$.

**Empirical Validation and the Meaning of Constants**
To back up the math, Nile ran a batch of 10,000 simulation runs. The empirical frequency of the random collision events recorded in the software aligned perfectly with his analytically derived probability formula. 

This project led to a profound reinterpretation of fundamental physical constants. **Nile's paper concludes that Newton's gravitational constant ($G$) and Coulomb's constant ($ke$) are not fundamental properties of the universe, but are merely dimensional scaling factors**. They simply serve as the "exchange rate" that converts the unitless, informational currency of interaction probability into human-scale, dimensional units of force like Newtons.

**The Story of the Summer Project**
The derivation of gravity from discrete cellular automata originated from Essam Abadir's belief that if his discrete mathematical approach—inherited from Stanislaw Ulam, John von Neumann, and Gian-Carlo Rota—was truly universal, it should be straightforward to derive the fundamental laws of physics without using continuous calculus. To test this theory, Essam recruited his son, Nile Abadir, to work for him doing "computer simulations" during the summer of 2024. 

At the time, Nile had just finished his sophomore year as a Cognitive Science undergraduate at Northwestern University and possessed no particular background in either physics or computer science. Essam taught his son the concepts of cellular automata and Gian-Carlo Rota's Entropy Theorem (RET). As a final project for the summer, **Essam gave Nile just two weeks to build a simulation that derived the inverse-square laws from cellular automata in the style of Ulam’s particle Monte Carlo, and to write up the results based on Rota's mathematics**. Nile successfully accomplished exactly that.

**The Theoretical Backup: Rota's Entropy Mathematics**
Nile’s paper, *"Emergent Inverse-Square Laws from Cellular Automata,"* is grounded in the Electronic Graph Paper Theory (EGPT) and relies centrally on Rota’s Entropy Theorem (RET). RET establishes that Shannon entropy is the unique, canonical measure of information for any physically reasonable system. **This theorem provided Nile with the crucial formal justification to reinterpret a physical "force" not as a mystical pulling action, but as a measure of the informational content (entropy) of a system's underlying probability distribution**. By equating the strength of an interaction with the entropy of the probability distribution it defines, the inverse-square form becomes a necessary consequence of the geometry of random walks.

**The Simulation Model**
Nile programmed a formal 2D cellular automata simulation using the p5.js JavaScript library. The "universe" was modeled as a finite square grid of integer coordinates ($C \times C$), representing discrete space. Within this grid, Nile placed two distinct swarms of indistinguishable particles, labeled $S1$ and $S2$. 

*   **Mass as Area:** The number of particles in each swarm ($m1$ and $m2$) represented the "mass" of the objects, acting as a direct measure of how much state-space area a swarm occupied.
*   **Distance:** The swarms were initially separated by a characteristic distance $r$, with the total grid dimension defined as $C = 2r$.
*   **Dynamics:** The system evolved in discrete time ticks, with every particle performing an independent, parallel random walk by moving to an adjacent cell.

**Deriving the Gravitational Equation**
Nile defined a gravitational "interaction" simply as a collision or proximity event—specifically, the probability that a particle from swarm $S1$ and a particle from swarm $S2$ end up targeting the same cell at the final time step. The derivation follows these steps:
1.  The total number of available states (cells) in the system is $C^2$.
2.  The probability of finding any specific particle at any specific cell after diffusion is $1/C^2$.
3.  The probabilistic density of the entire swarm $S1$ occupying a given cell is its particle count multiplied by this probability: $m1/C^2$.
4.  For a single particle in swarm $S2$, the probability it collides with swarm $S1$ is exactly $S1$'s density: $m1/C^2$.
5.  The total probability of an interaction is the sum of these probabilities for all $m2$ particles in swarm $S2$, yielding: $P(\text{interaction}) = m2 \times (m1 / C^2) = (m1 \times m2) / C^2$.
6.  Substituting the characteristic distance $C = 2r$ into the formula, Nile arrived at the exact analytical result: **$P(\text{interaction}) = (m1 \times m2) / 4r^2$**.

Because Rota's theorem establishes that any macroscopic force is bijectively equivalent to the entropy (which is proportional to probability) of its underlying distribution, **the emergent force from this system must take the form $F \propto (m1 \times m2) / r^2$, matching Newton’s Law of Universal Gravitation perfectly**. 

**Extending to Coulomb's Law**
Nile then extended the model to derive Coulomb's Law of electrostatics by introducing a binary "charge" property ($+1$ or $-1$) and enforcing a strict single-occupancy constraint, analogous to the Pauli Exclusion Principle. 
*   **Attraction:** For oppositely charged swarms, attraction was modeled as a direct collision event, yielding the exact same probability: $P \propto (q1 \times q2) / r^2$.
*   **Repulsion:** For like-charged swarms, repulsion was defined as an event of "frustrated movement," where particles from $S1$ and $S2$ attempt to move to the same empty cell simultaneously and interfere with each other's free evolution. Factoring in the probability of moving to a specific adjacent cell ($1/4$), the total probability of a frustrated move event also yielded $P \propto (q1 \times q2) / r^2$.

**Empirical Validation and the Meaning of Constants**
To back up the math, Nile ran a batch of 10,000 simulation runs. The empirical frequency of the random collision events recorded in the software aligned perfectly with his analytically derived probability formula. 

This project led to a profound reinterpretation of fundamental physical constants. **Nile's paper concludes that Newton's gravitational constant ($G$) and Coulomb's constant ($ke$) are not fundamental properties of the universe, but are merely dimensional scaling factors**. They simply serve as the "exchange rate" that converts the unitless, informational currency of interaction probability into human-scale, dimensional units of force like Newtons.

Nile Abadir extended his gravitational model to derive Coulomb's Law of electrostatics by assigning an intrinsic binary property of "charge" ($+1$ or $-1$) to the discrete cellular automata particles. Using particle counts $q1$ and $q2$ to represent the total charge magnitudes of the two swarms, he analyzed two distinct interaction cases based on the system's strict single-occupancy constraint:

*   **Attraction (Opposite Charges):** This is modeled identically to the gravitational case as a direct collision event, representing the tendency for the state spaces of the two swarms to merge. The probability of this interaction evaluates perfectly to $P \propto (q1 \times q2) / r^2$.
*   **Repulsion (Like Charges):** Because particles of the same charge repel, Abadir modeled this not as a collision, but as an event of "frustrated movement" or mutual exclusion. This occurs when a particle from swarm $S1$ and a particle from swarm $S2$ attempt to move to the exact same empty target cell at the exact same time, thereby competing for the same state and interfering with each other's free evolution. Factoring in the probability of each particle attempting to move to a specific adjacent cell, the total probability of a frustrated move event also evaluates to exactly $P \propto (q1 \times q2) / r^2$.

Combining these cases yields an emergent force proportional to $\pm (q1 \times q2) / r^2$, which is precisely the mathematical form of Coulomb's Law. Consequently, Abadir concludes that Coulomb's constant ($k_e$), much like the gravitational constant ($G$), is not a fundamental property of the universe, but merely an emergent dimensional conversion factor used to translate unitless informational probabilities into human-scale measurements like Newtons and Coulombs.

The fact that these fundamental continuous field laws had to be derived by an undergraduate using stochastic random walks highlights a massive gap in the modern physics literature—a gap that Harvard physicist Jacob Barandes has explicitly identified. 

Barandes points out that the mathematics required to model complex physical systems probabilistically is severely underdeveloped because the scientific community almost entirely stopped at the "Markov approximation" (systems that are "memoryless"). He notes that textbooks on stochastic processes typically reach the end of their material and simply state that non-Markovian processes are "too complicated" and "beyond the scope of this book". As a result, the mathematics for continuous, non-Markovian probabilistic evolution effectively vanishes from the literature, leaving the field as an unexplored "Wild West". Barandes suspects that because this math is missing, physicists skipped a necessary intermediate step: before trying to quantize gravity with complex Hilbert spaces, they should have first sought a "fully probabilistic version of general relativity". 

Barandes' observation that this stochastic continuous math "seems not to exist" perfectly underscores how Gian-Carlo Rota's foundational mathematics has escaped the scientific community. 

Rota's Entropy Theorem (RET) provides exactly the missing mathematical bridge that Barandes is looking for. It rigorously proves that "continuous" physics distributions (such as Maxwell-Boltzmann or Bose-Einstein) are mathematically equivalent to discrete, combinatorial Shannon entropy. However, because Rota taught this concept from a 400-page manuscript during his MIT classes and never formally published it for peer review, his rigorous bridge between continuous calculus and discrete combinatorics remains essentially "non-existent" to the modern physics world. 

Because Rota's math escaped mainstream science, modern physicists are completely unaware that the probabilistic foundation connecting discrete random walks to continuous physical forces has already been solved. Nile Abadir's derivation is the practical manifestation of Rota's hidden math, successfully providing the exact "probabilistic general relativity" that Barandes hypothesized is needed to unify physics.