export interface SelectProps {
    onChange: (value: string) => void;
    value?: string;
    className?: string;
    placeholder?: string;
    required?: boolean;
  }