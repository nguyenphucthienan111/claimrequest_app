import React, { useEffect, useState } from 'react';
import { getRoleOptions } from '../services/roleService';
import { SelectProps } from "../types/SelectProps"


const RoleSelect: React.FC<SelectProps> = ({
  onChange,
  value,
  className = '',
  placeholder = 'Select Role',
  required = false
}) => {
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const roleOptions = await getRoleOptions();
        setOptions(roleOptions);
      } catch (error) {
        console.error('Error fetching roles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  return (
    <select
      className={`form-select ${className}`}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={loading}
    >
      <option value="" disabled>
        {loading ? 'Loading roles...' : placeholder}
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default RoleSelect; 