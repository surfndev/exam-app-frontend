import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

type CheckIn = {
  id: string;
  courseCode: string;
  date: string;
  time: string;
  location: string;
  verified: boolean;
};

type CheckInLogProps = {
  checkIns: CheckIn[];
};

const CheckInLog = ({ checkIns }: CheckInLogProps) => {
  return (
    <View className="space-y-4">
      {checkIns.map((checkIn) => (
        <View key={checkIn.id} className="bg-white p-4 rounded-xl shadow-sm mt-4">
          <View className="flex-row justify-between items-center">
            <Text className="font-psemibold">{checkIn.courseCode}</Text>
            <View className={`flex-row items-center ${
              checkIn.verified ? 'text-green-500' : 'text-yellow-500'
            }`}>
              <Ionicons 
                name={checkIn.verified ? "checkmark-circle" : "time"} 
                size={16} 
                color={checkIn.verified ? "#10B981" : "#F59E0B"} 
              />
              <Text className={`ml-1 ${
                checkIn.verified ? 'text-green-500' : 'text-yellow-500'
              }`}>
                {checkIn.verified ? 'Verified' : 'Pending'}
              </Text>
            </View>
          </View>
          <Text className="text-gray-600 mt-1">{checkIn.date} • {checkIn.time}</Text>
          <Text className="text-gray-500 text-sm mt-1">{checkIn.location}</Text>
        </View>
      ))}
    </View>
  );
};

export default CheckInLog;