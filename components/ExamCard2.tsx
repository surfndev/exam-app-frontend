import React from 'react';
import { View, Text, ImageBackground, Pressable } from 'react-native';
import { Entypo, AntDesign } from '@expo/vector-icons';
import { images } from '../constants';
import { router } from 'expo-router';

export interface Room {
  id: string;
  name: string;
  location: string;
}

export interface ExamCard2Props {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  duration: number;
  room: Room[];
  isAdmin?: boolean;
}

const backgroundImage = require('../assets/images/cal.png')
const ExamCard2: React.FC<ExamCard2Props> = ({
  id,
  title,
  date,
  start_time,
  end_time,
  duration,
  room,
  isAdmin = false,
}) => {
  const handlePress = () => {
    router.push({
      pathname: `/screen/seating-plan`,
      params: { 
        id,
        title,
        date,
        start_time,
        end_time,
        duration: duration.toString(),
        room: JSON.stringify(room) // Convert the room array to string here
      }
    });
  };

  const [courseCode, ...courseName] = title.split(' - ');


  return (
    <Pressable
      onPress={handlePress}
      className="mx-4 mb-4 bg-white rounded-2xl overflow-hidden border border-gray-100"
    >
      {/* Header Section */}
      <View className="p-4 border-b border-gray-100">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-sm font-pmedium text-secondary">
              {courseCode}
            </Text>
            <Text className="text-lg font-psemibold text-gray-900 mt-1">
              {courseName.join(' - ')}
            </Text>
          </View>
          
          <View className="bg-secondary/10 px-3 py-1 rounded-full">
            <Text className="text-secondary font-pmedium text-sm">
              {duration} min
            </Text>
          </View>
        </View>
      </View>

      {/* Details Section */}
      <ImageBackground 
        source={backgroundImage}
        className="w-full"
        resizeMode='cover'
      >
        <View className="p-4 space-y-3 bg-white/90">
          <View className="flex-row items-center space-x-3 mb-3">
            <Entypo name="calendar" size={18} color="black" />
            <Text className="text-sm font-pregular font-bold text-gray-700 ml-1">
              {date}
            </Text>
          </View>

          <View className="flex-row items-center space-x-3 mb-3">
            <AntDesign name="clockcircle" size={18} color="black" />
            <Text className="text-sm font-pregular text-gray-700 ml-1">
              {start_time} - {end_time}
            </Text>
          </View>

          <View className="flex-row items-center space-x-3 mb-3">
            <Entypo name="location" size={18} color="black" />
            <Text className="text-sm font-pregular text-gray-700 ml-1">
              {room[0]?.location || 'Location TBA'}
            </Text>
          </View>
        </View>
      </ImageBackground>

      {/* Admin Actions */}
      {isAdmin && (
        <View className="px-4 py-3 bg-white border-t border-gray-100">
          <Pressable
            className="bg-secondary py-2 px-4 rounded-lg self-end"
            onPress={() => {
              // Add admin actions here
            }}
          >
            <Text className="text-white text-sm font-pmedium text-right">
              Manage Exam
            </Text>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
};

export default ExamCard2;