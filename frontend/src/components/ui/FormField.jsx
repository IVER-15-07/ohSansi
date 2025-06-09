import { Input } from '.';

const FormField = ({ 
  label, 
  name, 
  type = 'text', 
  placeholder = '', 
  colSpan = 1, 
  required = false, 
  helperText = null,
  value,
  onChange,
  onBlur,
  error,
  ...props 
}) => {
  
  return (
    <div className={`col-span-1 md:col-span-${colSpan}`}>
      <Input
        label={label}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        error={error}
        helperText={!required && !error ? (helperText || "Campo opcional") : undefined}
        {...props}
      />
    </div>
  );
};

export default FormField;
