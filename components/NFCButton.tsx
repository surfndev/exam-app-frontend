// components/NFCButton.tsx
import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import CustomButton from './CustomButton';
import { Ionicons } from '@expo/vector-icons';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import axios from 'axios';
import { createApiUrl } from '@/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

interface UserData {
  id: string;
  email: string;
  seat: string | null;
  tag_serial_number: string | null;
  check_in_time: string | null;
}

type NFCButtonProps = {
  examId: string;
  userId:String;
  onVerificationComplete: (tagData: string) => void;
  onError?: (error: Error) => void;
  onSerialComplete: (serialNumber: string) => void;
};

export const NFCButton = ({ 
  onSerialComplete,
  examId, 
  onVerificationComplete, 
  onError,
  userId // Add this prop
}: NFCButtonProps & { userId: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [userList, setUserList] = useState<UserData[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // First useEffect to fetch data
  useEffect(() => {
      fetchUserList();
  }, [examId]);

  const fetchUserList = async () => {
      try {
          setIsLoading(true); // Show loading state while fetching
          const token = await AsyncStorage.getItem('token');

          const response = await fetch(createApiUrl(`/exam/${examId}/user_list`), {
              method: 'GET',
              headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
              },
          });

          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          console.log('Fetched user list:', data); // Debug log
          setUserList(data);
          setIsDataLoaded(true);

      } catch (error) {
          console.error('Failed to fetch user list:', error);
          if (error instanceof Error) {
              if (error.message.includes('401')) {
                  Alert.alert('Error', 'Session expired. Please login again.');
                  return;
              }
              if (error.message.includes('403')) {
                  Alert.alert('Error', 'You do not have permission to access this resource.');
                  return;
              }
          }
          Alert.alert('Error', 'Failed to fetch user data. Please try again.');
      } finally {
          setIsLoading(false);
      }
  };

  // Second useEffect to check for already checked-in user
  // Only run this after data is loaded
  useEffect(() => {
    if (isDataLoaded && userList.length > 0) {
        console.log('Checking current user check-in status...');
        const currentUser = userList.find(u => u.id === userId);
        
        console.log('Current user:', currentUser);
        
        if (currentUser?.check_in_time) {
            console.log('Current user is already checked in');
            setIsVerified(true);
            
            // Show alert with custom icon and message
            Alert.alert(
                'Already Checked In',
                'You have already checked in for this exam.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Redirect to home tab after alert is dismissed
                            router.replace('/(tabs)/home');
                        }
                    }
                ],
                { 
                    // Custom alert properties
                    cancelable: false 
                }
            );

        
        }
    }
}, [isDataLoaded, userList, userId]);



// Modified verify function to check against current user
const verifyUserAndTag = (tagId: string) => {
    console.log('Starting tag verification...');
    console.log('Tag ID:', tagId);
    console.log('Current user id:', userId);

    // First find the current user
    const currentUser = userList.find(u => u.id === userId);
    if (!currentUser) {
        throw new Error('User not found in exam list');
    }

    // Check if the scanned tag matches any seat assignment
    const seatAssignment = userList.find(u => u.tag_serial_number === tagId);
    if (!seatAssignment) {
        throw new Error('This seat is not assigned to any student');
    }

    // Check if this is the correct seat for the current user
    /*
    if (seatAssignment.id !== userId) {
        throw new Error('This is not your assigned seat. Please find your assigned seat.');
    }*/

    if (currentUser.check_in_time) {
        throw new Error('You have already checked in for this exam.');
    }
    onSerialComplete(tagId);
    return currentUser;
};

  const handleNFCPress = async () => {
      if (!isDataLoaded) {
          Alert.alert('Error', 'Please wait for user data to load');
          return;
      }

      try {
          setIsLoading(true);
          
          await NfcManager.start();
          
          const isSupported = await NfcManager.isSupported();
          if (!isSupported) {
              throw new Error('NFC is not supported on this device');
          }

          const isEnabled = await NfcManager.isEnabled();
          if (!isEnabled) {
              throw new Error('Please enable NFC in settings');
          }

          await NfcManager.requestTechnology(NfcTech.Ndef);

          const tag = await NfcManager.getTag();
          console.log('NFC Tag read:', tag); // Debug log
          
          const tagId = tag?.id?.toString() || '';
          console.log('Tag ID:', tagId); // Debug log

          const verifiedUser = verifyUserAndTag(tagId);
          console.log('Verified user:', verifiedUser); // Debug log

          setIsVerified(true);
          onVerificationComplete(tagId);

      } catch (error) {
          console.error('NFC Error:', error);
          onError?.(error as Error);
          Alert.alert(
              'Verification Error',
              error instanceof Error ? error.message : 'Failed to verify seat'
          );
      } finally {
          NfcManager.cancelTechnologyRequest();
          setIsLoading(false);
      }
  };

  return (
      <CustomButton
          title={isVerified ? 'NFC Verified' : 'Scan NFC Tag'}
          handlePress={handleNFCPress}
          disabled={isVerified || !isDataLoaded} // Disable button until data is loaded
          isLoading={isLoading}
          containerStyles={`flex-row items-center ${isVerified ? 'bg-secondary' : 'bg-gray-200'} p-2 rounded-md mb-2`}
          textStyles="text-black"
      >
          <Ionicons
              name={isVerified ? "checkmark-circle" : "hardware-chip"}
              size={24}
              color="white"
          />
      </CustomButton>
  );
};