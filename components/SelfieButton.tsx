import React, { useState, useRef, useEffect } from 'react';
import { View, Alert, TouchableOpacity, Image, Text } from 'react-native';
import { Camera, CameraView, CameraCapturedPicture, PermissionStatus, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import CustomButton from './CustomButton';
import { Ionicons } from '@expo/vector-icons';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createApiUrl } from '@/config';

type SelfieButtonProps = {
  isActive: boolean;
  examId: string;
  userId: string | null;
  tagSerialNumber: string; // Add this to receive the NFC tag number

  onVerificationComplete: (selfieUri: string) => void;
  onError?: (error: Error) => void;
};

export const SelfieButton = ({ 
  examId,
  userId,
  tagSerialNumber,
  isActive,
  onVerificationComplete,
  onError
}: SelfieButtonProps) => {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<PermissionStatus>();
  const [facing, setFacing] = useState<CameraType>('front');
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setCameraPermission(status as PermissionStatus);
  };

  const handleTakeSelfie = async () => {
    if (!isActive) return;
    
    try {
      setIsLoading(true);
      
      if (cameraPermission !== 'granted') {
        const { status } = await Camera.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Camera Permission Required',
            'Please enable camera access in your device settings to take a selfie.'
          );
          setIsLoading(false);
          return;
        }
        setCameraPermission(status);
      }
      
      setShowCamera(true);
    } catch (error) {
      handleError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          base64: true,
        });
  
        if (!photo || !photo.uri) {
          throw new Error('Failed to capture photo.');
        }
  
        const processedImage = await manipulateAsync(
          photo.uri,
          [{ resize: { width: 500 } }],
          { compress: 0.7, format: SaveFormat.JPEG }
        );
  
        setCapturedImage(processedImage.uri);
        setShowCamera(false);
        setShowConfirmation(true);
      } catch (error) {
        handleError(error as Error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleConfirm = async () => {
    if (!capturedImage) return;
    
    setIsLoading(true);
    try {
      // Get token from storage
      const token = await AsyncStorage.getItem('token');
      
      // First API call - NFC verification
      const nfcResponse = await fetch(createApiUrl(`/exam/${examId}/nfc`), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          tag_serial_number: tagSerialNumber,
        }),
      });
  
      if (!nfcResponse.ok) {
        throw new Error('Failed to verify NFC');
      }
  
      // Convert image to base64 if it isn't already
      let base64Image = '';
      if (capturedImage.startsWith('data:image')) {
        base64Image = capturedImage.split(',')[1];
      } else {
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64String = reader.result as string;
            resolve(base64String.split(',')[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
  
      // Second API call - Upload image
      const imageResponse = await fetch(createApiUrl(`/exam/${examId}/upload_image`), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          image: base64Image,
        }),
      });
  
      if (!imageResponse.ok) {
        throw new Error('Failed to upload image');
      }
  
      // If both calls are successful
      setIsVerified(true);
      onVerificationComplete(capturedImage);
      setShowConfirmation(false);
  
    } catch (error) {
      handleError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRetake = () => {
    setCapturedImage(null);
    setShowConfirmation(false);
    setShowCamera(true);
  };

  const pickImageFromLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0].uri) {
        const uri = result.assets[0].uri;
        setIsVerified(true);
        onVerificationComplete(uri);
      }
    } catch (error) {
      handleError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (error: Error) => {
    console.error('Selfie Error:', error);
    setIsLoading(false);
    setShowCamera(false);
    onError?.(error);
    Alert.alert(
      'Selfie Error', 
      error.message || 'Failed to capture selfie'
    );
  };

  if (showConfirmation && capturedImage) {
    return (
      <View className="flex-1 bg-f7f7f7 justify-center items-center p-4">
        <View className="bg-white rounded-lg w-full max-w-sm p-4">
          <Text className="text-lg font-medium text-center mb-4">
            Upload a clear photo for your face
          </Text>
          <Image 
            source={{ uri: capturedImage }} 
            className="w-full aspect-square rounded-lg mb-4"
            resizeMode="cover"
          />
          <View className="flex-row justify-center space-x-4">
            <TouchableOpacity 
              onPress={handleRetake}
              className="bg-red-400 px-6 py-3 rounded-lg m-2"
            >
              <Text className="text-white">Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleConfirm}
              className="bg-secondary px-6 py-3 rounded-lg m-2"
            >
              <Text className="text-white">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (showCamera && cameraPermission === 'granted') {
    return (
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        <CameraView
          ref={cameraRef}
          style={{ 
            flex: 1,
            width: '100%',
            aspectRatio: 1,
            alignSelf: 'center',
          }}
          facing={facing}
        >
          <View style={{ 
            position: 'absolute', 
            bottom: 40,
            alignSelf: 'center',
            flexDirection: 'row',
            gap: 20
          }}>
            <TouchableOpacity 
              onPress={() => setFacing(
                facing === ImagePicker.CameraType.front ? ImagePicker.CameraType.back : ImagePicker.CameraType.front
              )}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: 'rgba(255,255,255,0.3)',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Ionicons name="camera-reverse" size={24} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={takePicture}
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: '#fff',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            />
          </View>
        </CameraView>
      </View>
    );
  }

  if (capturedImage) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Image 
          source={{ uri: capturedImage }} 
          style={{ 
            width: '90%', 
            aspectRatio: 1,
            borderRadius: 10
          }} 
          resizeMode="cover"
        />
        <View style={{ 
          flexDirection: 'row', 
          gap: 20, 
          marginTop: 40 
        }}>
          <CustomButton
            title="Retake"
            handlePress={() => {
              setCapturedImage(null);
              setShowCamera(true); // Go back to camera
            }}
            containerStyles="bg-red-500 px-6 py-3 rounded-lg"
            textStyles="text-white"
          />
          <CustomButton
            title="Confirm"
            handlePress={() => {
              setShowCamera(false);
              setIsVerified(true);
            }}
            containerStyles="bg-green-500 px-6 py-3 rounded-lg"
            textStyles="text-white"
          />
        </View>
      </View>
    );
  }

  return showCamera ? (
    <View style={{ flex: 1 }}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing={facing}
      >
        {/* Your camera UI buttons */}
      </CameraView>
    </View>
  ) : (
    <CustomButton
      title={
        isVerified ? 'Selfie Verified' : 
        isActive ? 'Take Selfie' : 'Complete NFC First'
      }
      handlePress={handleTakeSelfie}
      disabled={!isActive || isVerified}
      isLoading={isLoading}
      containerStyles={`${
        isVerified ? 'bg-gray-400' : 
        isActive ? 'bg-secondary' : 'bg-gray-300'
      } flex-row space-x-2`}
      textStyles="text-white"
    >
      <Ionicons 
        name={isVerified ? "checkmark-circle" : "camera"} 
        size={24} 
        color="white" 
      />
    </CustomButton>
  );
};