import React, { useEffect, useState } from 'react';
import { getDepartmentOptions } from '../services/departmentService';
import { SelectProps } from "../types/SelectProps"


const DepartmentSelect: React.FC<SelectProps> = ({
  onChange,
  value,
  className = '',
  placeholder = 'Select Department',
  required = false
}) => {
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const departmentOptions = await getDepartmentOptions();
        setOptions(departmentOptions);
      } catch (error) {
        console.error('Error fetching departments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
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
        {loading ? 'Loading departments...' : placeholder}
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default DepartmentSelect; 