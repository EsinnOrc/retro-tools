export interface Step {
  id: string;
  name: string;
}

export interface Template {
  id: string;
  name: string;
  step_names?: Step[];
}

export interface Room {
  id: string;
  template_id: string;
  is_active: boolean;
  templateName?: string;
  created_at: {
    seconds: number;
    nanoseconds: number;
  };
}
