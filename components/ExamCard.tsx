import React from 'react';
import { View, Text, ImageBackground, Pressable } from 'react-native';
import { Entypo, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { images } from '../constants';
import { router } from 'expo-router';

export interface Room {
  id: string;
  name: string;
  location: string;
}

export interface ExamCardProps {
  id: string;
  title: string;
  description: string | null;
  date: string;
  start_time: string;
  end_time: string;
  duration: number;
  seat: string;
  room_name: string;
  room_location: string;
  isAdmin?: boolean;
}

const backgroundImage = require('../assets/images/cal.png')
const ExamCard: React.FC<ExamCardProps> = ({
  id,
  title,
  date,
  start_time,
  end_time,
  duration,
  seat,
  room_name,
  room_location
}) => {
  const handlePress = () => {
    router.push({
      pathname: `/check-in/[id]`,
      params: {
        id,
        title,
        date,
        start_time,
        end_time,
        duration: duration.toString(),
        room_name: JSON.stringify(room_name), // Convert the room array to string here
        room_location
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
              {room_location || 'Location TBA'}
            </Text>
          </View>
        </View>
      </ImageBackground>


      <View className="px-4 py-3 bg-white border-t border-gray-100">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center space-x-2">
          <MaterialCommunityIcons name="seat" size={14} color="#8A2BE2" />
            <Text className="text-secondary text-sm font-pmedium">
             {seat}
            </Text>
          </View>
          <Pressable
            className="bg-secondary py-2 px-4 rounded-lg"
            onPress={() => {
              // Add admin actions here
            }}
          >
            <Text className="text-white text-sm font-pmedium text-right">
              Check-in Exam
            </Text>
          </Pressable>
        </View>
      </View>


    </Pressable>
  );
};

export default ExamCard;