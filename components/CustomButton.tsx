// components/CustomButton.tsx
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import React from 'react';

type CustomButtonProps = {
  title: string;
  handlePress: () => void;
  containerStyles?: string;
  textStyles?: string;
  isLoading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
};

const CustomButton = ({
  title,
  handlePress,
  containerStyles = '',
  textStyles = '',
  isLoading = false,
  disabled = false
}: CustomButtonProps) => {
  return (
    <TouchableOpacity 
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={disabled || isLoading}
      className={`bg-secondary rounded-xl min-h-[62px] justify-center items-center ${containerStyles} ${
        (isLoading || disabled) ? 'opacity-50' : ''
      }`}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="black" />
      ) : (
        <Text className={`text-black font-psemibold text-lg ${textStyles}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;