export interface Step {
  id: string;
  name: string;
}

export type Template = {
  id: string;
  name: string;
  step_names?: Step[];
};
