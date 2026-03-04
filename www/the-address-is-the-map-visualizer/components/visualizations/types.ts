import type { CNFProblem } from '../../types';

export interface VisualizationViewComponent {
  name: string;
  icon: string;
  description: string;
  component: React.FC<VisualizationViewProps>;
  suitable: (problem: CNFProblem) => boolean;
}

export interface VisualizationViewProps {
  problem: CNFProblem;
  assignment?: boolean[];
}







