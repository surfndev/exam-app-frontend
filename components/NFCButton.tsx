// components/NFCButton.tsx
import CustomButton from './CustomButton';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text } from 'react-native';

type NFCButtonProps = {
  isVerified: boolean;
  isLoading?: boolean;
  onPress: () => void;
};

export const NFCButton = ({ isVerified, isLoading, onPress }: NFCButtonProps) => (
  <CustomButton
    title={isVerified ? 'NFC Verified' : 'Scan NFC Tag'}
    handlePress={onPress}
    disabled={isVerified}
    isLoading={isLoading}
    containerStyles={`${isVerified ? 'bg-gray-400' : 'bg-secondary'} flex-row space-x-2`}
    textStyles="text-white"
  >
    <Ionicons 
      name={isVerified ? "checkmark-circle" : "md-nfc"} 
      size={24} 
      color="white" 
    />
  </CustomButton>
);