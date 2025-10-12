"use client";

import React, { useState, useEffect } from 'react';
import { useFormikContext } from 'formik';
import CustomInput from '../../../reusableComponents/CustomInput';
import CustomSelect from '../../../reusableComponents/CustomSelect';
import SearchableSelect from '../../../reusableComponents/SearchableSelect';
import CustomButton from '../../../reusableComponents/CustomButton';
import { useHttpService } from '../../../../lib/http-service';

type BaseField = {
  label: string;
  name: string;
  isRequired: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
};

type SearchableSelectField = BaseField & {
  type: 'searchable-select';
  options: { key: string; id: string; value: string | React.ReactNode; subValue?: string | React.ReactNode }[];
  placeholder: string;
  searchPlaceholder: string;
  multi?: boolean;
};

type SelectField = BaseField & {
  type: 'select';
  options: { value: string; label: string }[];
};

type InputField = BaseField & {
  type: 'text' | 'number';
  placeholder: string;
  min?: number;
  max?: number;
  isCurrency?: boolean;
};

type VehicleField = SearchableSelectField | SelectField | InputField;

export default function VehicleDetailsStep() {
  const { values, setFieldValue } = useFormikContext<any>();
  const { getRequest } = useHttpService();
  const [makes, setMakes] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState({
    makes: false,
    models: false,
    colors: false,
    branches: false
  });
  const [selectedMakeId, setSelectedMakeId] = useState<string>('');

  // Fetch makes from API
  const fetchMakes = async () => {
    try {
      setLoading(prev => ({ ...prev, makes: true }));
      const result = await getRequest('/api/vehicle-configuration/makes');
      if (result.success && result.data) {
        const makeOptions = result.data.makes?.map((make: any) => ({
          key: make.code || make.name,
          id: make.id,
          value: make.name,
          subValue: make.description
        })) || [];
        setMakes(makeOptions);
      }
    } catch (error) {
      console.error('Error fetching makes:', error);
    } finally {
      setLoading(prev => ({ ...prev, makes: false }));
    }
  };

  // Fetch models from API based on make
  const fetchModels = async (makeId: string) => {
    if (!makeId) {
      setModels([]);
      return;
    }

    try {
      setLoading(prev => ({ ...prev, models: true }));
      const result = await getRequest(`/api/vehicle-configuration/models?make_id=${makeId}`);
      if (result.success && result.data) {
        const modelOptions = result.data.models?.map((model: any) => ({
          key: model.code || model.name,
          id: model.id,
          value: model.name,
          subValue: model.description
        })) || [];
        setModels(modelOptions);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(prev => ({ ...prev, models: false }));
    }
  };

  // Fetch colors from API
  const fetchColors = async () => {
    try {
      setLoading(prev => ({ ...prev, colors: true }));
      const result = await getRequest('/api/vehicle-configuration/colors');
      if (result.success && result.data) {
        const colorOptions = result.data.colors?.map((color: any) => ({
          key: color.name, // Use name directly for easier matching
          id: color.id,
          value: (
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: color.hex_code || '#ccc' }}
              />
              <span>{color.name}</span>
            </div>
          ),
          subValue: color.description
        })) || [];
        setColors(colorOptions);
      }
    } catch (error) {
      console.error('Error fetching colors:', error);
    } finally {
      setLoading(prev => ({ ...prev, colors: false }));
    }
  };

  // Fetch branches from API
  const fetchBranches = async () => {
    try {
      setLoading(prev => ({ ...prev, branches: true }));
      const result = await getRequest('/api/branches');
      if (result.success && result.data) {
        const branchOptions = result.data.branches?.filter((branch: any) => branch.is_active).map((branch: any) => ({
          key: branch.code,
          id: branch.id,
          value: branch.name,
          subValue: `${branch.code}${branch.address ? ` - ${branch.address}` : ''}`
        })) || [];
        setBranches(branchOptions);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setLoading(prev => ({ ...prev, branches: false }));
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchMakes();
    fetchColors();
    fetchBranches();
  }, []);

  // Watch for make changes and fetch models accordingly
  useEffect(() => {
    if (values.make && values.make !== selectedMakeId) {
      setSelectedMakeId(values.make);
      // Clear model selection when make changes
      if (values.model) {
        setFieldValue('model', '');
      }
      fetchModels(values.make);
    } else if (!values.make) {
      setSelectedMakeId('');
      setModels([]);
      if (values.model) {
        setFieldValue('model', '');
      }
    }
  }, [values.make, selectedMakeId, setFieldValue, values.model]);

    // Store the initial model value to set after models are loaded
  const [initialModelValue, setInitialModelValue] = useState<string>('');

  // Handle model selection after models are loaded
  useEffect(() => {
    // If we have models loaded and an initial model value, try to set it
    if (models.length > 0 && initialModelValue && !values.model) {
      const modelOption = models.find(model => model.value === initialModelValue);
      if (modelOption) {
        setFieldValue('model', modelOption.id);
        setInitialModelValue(''); // Clear the initial value after setting
      }
    }

    // Handle regular model updates
    if (values.model && models.length > 0 && values.model !== initialModelValue) {
      const modelOption = models.find(model => model.value === values.model);
      if (modelOption && modelOption.id !== values.model) {
        setFieldValue('model', modelOption.id);
      }
    }
  }, [models, values.model, initialModelValue, setFieldValue]);

  // Handle initial values for edit mode
  useEffect(() => {
    const handleInitialValues = async () => {
      // Store the initial model value for later use
      if (values.model && !initialModelValue) {
        setInitialModelValue(values.model);
      }

      // If we have initial values and the options are loaded, we need to find the correct IDs
      if (values.make && makes.length > 0) {
        // Find the make ID by name
        const makeOption = makes.find(make => make.value === values.make);
        if (makeOption && makeOption.id !== values.make) {
          setFieldValue('make', makeOption.id);
          setSelectedMakeId(makeOption.id);
          // Fetch models for this make
          fetchModels(makeOption.id);
        }
      }

      if (values.color && colors.length > 0) {
        // Find the color ID by name - we need to match by the color name from the API
        const colorOption = colors.find(color => {
          // The color name should be in the key field
          return color.key === values.color;
        });
        if (colorOption && colorOption.id !== values.color) {
          setFieldValue('color', colorOption.id);
        }
      }

      if (values.branch && branches.length > 0) {
        // Find the branch ID by name
        const branchOption = branches.find(branch => branch.value === values.branch);
        if (branchOption && branchOption.id !== values.branch) {
          setFieldValue('branch', branchOption.id);
        }
      }
    };

    handleInitialValues();
  }, [values.make, values.color, values.branch, values.yearOfManufacture, values.makeYear, values.model, makes, colors, branches, initialModelValue, setFieldValue]);

  const vehicleDetailsFields: VehicleField[] = [
    {
      label: 'Car Make',
      name: 'make',
      type: 'searchable-select',
      isRequired: true,
      options: makes,
      placeholder: 'Select Make',
      searchPlaceholder: 'Search makes...',
      disabled: false
    },
    {
      label: 'Car Model',
      name: 'model',
      type: 'searchable-select',
      isRequired: true,
      options: models,
      placeholder: values.make ? 'Select Model' : 'Please select a make first',
      searchPlaceholder: 'Search models...',
      disabled: !values.make || loading.models
    },
    {
      label: 'Make Year',
      name: 'makeYear',
      type: 'select',
      isRequired: true,
      options: Array.from({ length: 5 }, (_, i) => {
        const year = new Date().getFullYear() - i;
        return { value: year.toString(), label: year.toString() };
      })
    },
    {
      label: 'Car color',
      name: 'color',
      type: 'searchable-select',
      isRequired: true,
      options: colors,
      placeholder: 'Select Color',
      searchPlaceholder: 'Search colors...',
      disabled: false
    },
    {
      label: 'Age Range',
      name: 'ageRange',
      type: 'select',
      isRequired: true,
      options: [
        { value: '0-1', label: '0-1 years' },
        { value: '2-3', label: '2-3 years' },
        { value: '4-5', label: '4-5 years' },
        { value: '6-7', label: '6-7 years' },
        { value: '8+', label: '8+ years' }
      ]
    },
    {
      label: 'Serial number',
      name: 'serialNumber',
      type: 'text',
      isRequired: true,
      placeholder: 'Enter serial number',
      min: 1
    },
    {
      label: 'Plate number',
      name: 'plateNumber',
      type: 'text',
      isRequired: true,
      placeholder: 'Enter plate number'
    },
    {
      label: 'Mileage',
      name: 'mileage',
      type: 'number',
      isRequired: true,
      placeholder: 'Enter mileage',
      min: 0
    },
    {
      label: 'Year of Manufacture',
      name: 'yearOfManufacture',
      type: 'select',
      isRequired: true,
      options: Array.from({ length: 10 }, (_, i) => {
        const year = new Date().getFullYear() - i;
        return { value: year.toString(), label: year.toString() };
      })
    },
    {
      label: 'Car Class',
      name: 'carClass',
      type: 'select',
      isRequired: true,
      options: [
        { value: 'economy', label: 'Economy' },
        { value: 'compact', label: 'Compact' },
        { value: 'midsize', label: 'Midsize' },
        { value: 'fullsize', label: 'Full Size' },
        { value: 'luxury', label: 'Luxury' },
        { value: 'suv', label: 'SUV' },
        { value: 'truck', label: 'Truck' },
        { value: 'van', label: 'Van' }
      ]
    },
    {
      label: 'Plate Registration Type',
      name: 'plateRegistrationType',
      type: 'select',
      isRequired: true,
      options: [
        { value: 'private', label: 'Private' },
        { value: 'commercial', label: 'Commercial' },
        { value: 'government', label: 'Government' },
        { value: 'diplomatic', label: 'Diplomatic' }
      ]
    },
    {
      label: 'Expected Sale Price',
      name: 'expectedSalePrice',
      type: 'number',
      isRequired: true,
      placeholder: 'Enter expected sale price',
      min: 0,
      isCurrency: true
    },
    {
      label: 'Branch',
      name: 'branch_id',
      type: 'searchable-select',
      isRequired: true,
      options: branches,
      placeholder: 'Select Branch',
      searchPlaceholder: 'Search branches...',
      disabled: loading.branches
    }
  ];

  const ownerUserFields: VehicleField[] = [
    {
      label: 'Owner Name',
      name: 'owner_name',
      type: 'text',
      isRequired: true,
      placeholder: 'Enter owner name'
    },
    {
      label: 'User Name',
      name: 'actual_user_name',
      type: 'text',
      isRequired: false,
      placeholder: 'Enter user name'
    },
    {
      label: 'Owner ID',
      name: 'owner_id_number',
      type: 'text',
      isRequired: true,
      placeholder: 'Enter owner ID'
    },
    {
      label: 'User ID',
      name: 'actual_user_id_number',
      type: 'text',
      isRequired: false,
      placeholder: 'Enter user ID'
    }
  ];

  const technicalFields: VehicleField[] = [
    {
      label: 'Vehicle Load Capacity',
      name: 'vehicle_load_capacity',
      type: 'number',
      isRequired: true,
      placeholder: 'Enter vehicle load capacity',
      min: 1
    },
    {
      label: 'Technical Number',
      name: 'technical_number',
      type: 'text',
      isRequired: true,
      placeholder: 'Enter technical number'
    }
  ];

  return (
    <>
      <h2 className="text-2xl font-bold text-primary mb-8">Vehicle Details</h2>

      {/* Vehicle Details Section */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {vehicleDetailsFields.map((field, idx) => (
          <div key={field.name} className="flex flex-col gap-4">
            {field.type === 'searchable-select' ? (
              <SearchableSelect
                label={field.label}
                name={field.name}
                required={field.isRequired}
                options={field.options}
                placeholder={field.placeholder}
                searchPlaceholder={field.searchPlaceholder}
                disabled={field.disabled}
                readOnly={field.readOnly}
                multi={field.multi}
              />
            ) : field.type === 'select' ? (
              <CustomSelect
                label={field.label}
                name={field.name}
                required={field.isRequired}
                options={field.options}
                disabled={field.disabled}
                readOnly={field.readOnly}
              />
            ) : (
              <CustomInput
                label={field.label}
                name={field.name}
                required={field.isRequired}
                type={field.type}
                placeholder={field.placeholder}
                min={field.min}
                max={field.max}
                disabled={field.disabled}
                readOnly={field.readOnly}
                isCurrency={field.isCurrency}
                iconPosition="left"
              />
            )}
          </div>
        ))}
      </div>

      {/* Owner & User Information Section */}
      <h3 className="text-xl font-bold text-primary mb-6">Owner & User Information</h3>
      <div className="grid grid-cols-2 gap-6 mb-8">
        {ownerUserFields.map((field, idx) => (
          <div key={field.name} className="flex flex-col gap-4">
            <CustomInput
              label={field.label}
              name={field.name}
              required={field.isRequired}
              type={field.type}
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
              disabled={field.disabled}
              readOnly={field.readOnly}
              iconPosition="left"
            />
          </div>
        ))}
      </div>

      {/* Vehicle Capacity & Technical Info Section */}
      <h3 className="text-xl font-bold text-primary mb-6">Vehicle Capacity & Technical Info</h3>
      <div className="grid grid-cols-2 gap-6">
        {technicalFields.map((field, idx) => (
          <div key={field.name} className="flex flex-col gap-4">
            <CustomInput
              label={field.label}
              name={field.name}
              required={field.isRequired}
              type={field.type}
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
              disabled={field.disabled}
              readOnly={field.readOnly}
              iconPosition="left"
            />
          </div>
        ))}
      </div>
    </>
  );
}