import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Input } from '@/components/ui';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '@/utils/constants';

interface ChildFormData {
  name: string;
  age: string;
  gender: 'male' | 'female' | 'other' | null;
}

interface ChildFormProps {
  data: ChildFormData;
  onChange: (data: ChildFormData) => void;
  errors?: Partial<Record<keyof ChildFormData, string>>;
}

const GENDER_OPTIONS: { value: 'male' | 'female' | 'other'; label: string }[] = [
  { value: 'male', label: 'Boy' },
  { value: 'female', label: 'Girl' },
  { value: 'other', label: 'Other' },
];

export function ChildForm({ data, onChange, errors }: ChildFormProps) {
  return (
    <View style={styles.container}>
      <Input
        label="Child's Name"
        value={data.name}
        onChangeText={(name) => onChange({ ...data, name })}
        placeholder="Enter your child's name"
        error={errors?.name}
        autoCapitalize="words"
      />

      <Input
        label="Age (years)"
        value={data.age}
        onChangeText={(age) => onChange({ ...data, age })}
        placeholder="e.g., 3"
        keyboardType="number-pad"
        error={errors?.age}
        containerStyle={styles.input}
      />

      <View style={styles.genderContainer}>
        <Text style={styles.label}>Gender (optional)</Text>
        <View style={styles.genderOptions}>
          {GENDER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.genderOption,
                data.gender === option.value && styles.genderOptionSelected,
              ]}
              onPress={() => onChange({
                ...data,
                gender: data.gender === option.value ? null : option.value,
              })}
            >
              <Text
                style={[
                  styles.genderText,
                  data.gender === option.value && styles.genderTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    marginTop: SPACING.md,
  },
  genderContainer: {
    marginTop: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  genderOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  genderOption: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  genderOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + '20',
  },
  genderText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  genderTextSelected: {
    color: COLORS.primary,
  },
});
