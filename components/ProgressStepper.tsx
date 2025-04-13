// Custom ProgressStepper.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';

type ProgressStepperProps = {
  progress: number;
  steps: string[];
  activeColor?: string;
  inactiveColor?: string;
};

const ProgressStepper = ({
  progress,
  steps = ['Step 1', 'Step 2', 'Done'],
  activeColor = '#8A2BE2',
  inactiveColor = '#D1D5DB'
}: ProgressStepperProps) => {
  const currentStep = Math.floor(progress * (steps.length - 1));

  return (
    <View className="w-full mb-8">
      {/* Progress Bar Background */}
      <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <View 
          className="h-full rounded-full" 
          style={{
            width: `${progress * 100}%`,
            backgroundColor: activeColor
          }}
        />
      </View>

      {/* Step Indicators */}
      <View className="flex-row justify-between mt-3">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <View key={index} className="items-center">
              <View
                className={`w-8 h-8 rounded-full justify-center items-center ${
                  isCompleted ? 'bg-[#8A2BE2]' : 
                  isActive ? 'border-2 border-[#8A2BE2] bg-white' : 
                  'bg-gray-200'
                }`}
              >
                {isCompleted ? (
                  <MaterialIcons name="check" size={16} color="white" />
                ) : (
                  <Text className={`font-bold ${
                    isActive ? 'text-[#8A2BE2]' : 'text-gray-500'
                  }`}>
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text
                className={`mt-1 text-xs font-medium ${
                  isActive || isCompleted ? 'text-[#8A2BE2]' : 'text-gray-500'
                }`}
              >
                {step}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default ProgressStepper;