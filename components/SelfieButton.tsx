import React, { useState, useRef, useEffect } from 'react';
import { View, Alert, TouchableOpacity, Image, Text } from 'react-native';
import { Camera, CameraView, CameraCapturedPicture, PermissionStatus, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import CustomButton from './CustomButton';
import { Ionicons } from '@expo/vector-icons';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createApiUrl } from '@/config';
import * as FileSystem from 'expo-file-system';

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

  const baseDir = FileSystem.documentDirectory;
  const imagesDir = `${baseDir}m/images`;

  const takePicture = async () => {
    if (cameraRef.current) {
        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.7,
                exif: false,
            });

            if (!photo || !photo.uri) {
                throw new Error('Failed to capture photo.');
            }

            // Process the image to ensure it's not too large
            const processedImage = await manipulateAsync(
                photo.uri,
                [{ resize: { width: 800 } }], // Resize to a reasonable size
                { 
                    compress: 0.7,
                    format: SaveFormat.JPEG,
                }
            );
            // Create a directory for your images if it doesn't exist
            

            
            const mDir = `${baseDir}m`;
            const mDirInfo = await FileSystem.getInfoAsync(mDir);
            if (!mDirInfo.exists) {
                await FileSystem.makeDirectoryAsync(mDir, { intermediates: true });
            }

            // Then create the /m/images directory
            const imagesDirInfo = await FileSystem.getInfoAsync(imagesDir);
            if (!imagesDirInfo.exists) {
                await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true });
            }

            // Create a unique filename
            const filename = `selfie_${Date.now()}.png`;
            const filePath = `${imagesDir}/${filename}`;

            // Copy the image to /m/images
            await FileSystem.copyAsync({
                from: processedImage.uri,
                to: filePath
            });

            console.log('Image saved to:', filePath);
            console.log('Image directory structure:', imagesDir);

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
    if (!capturedImage || !userId) return;
    
    setIsLoading(true);
    try {
        // Get token from storage
        const token = await AsyncStorage.getItem('token');
        
        const nfcApiUrl = createApiUrl(`/exam/${examId}/nfc`);
        console.log('NFC API URL:', nfcApiUrl);
        
        const nfcRequestBody = {
            user_id: userId,
            tag_serial_number: tagSerialNumber,
        };
        console.log('NFC Request Body:', nfcRequestBody);
        
        console.log('Authorization Token:', token);
        
        const nfcResponse = await fetch(nfcApiUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(nfcRequestBody),
        });

        if (!nfcResponse.ok) {
            throw new Error('Failed to verify NFC');
        }

        // Create FormData instance
        const formData = new FormData();

       // Get the filename from the URI
       const filename = capturedImage.split('/').pop() || 'photo.jpg';
        
       // Append the image to FormData
       formData.append('image', {
           uri: capturedImage,
           name: filename,
           type: 'image/jpeg'
       } as any);

       formData.append('user_id', userId);

       // Upload image to your Laravel endpoint
       const imageResponse = await fetch(createApiUrl(`/exam/${examId}/upload_image`), {
           method: 'POST',
           headers: {
               'Accept': 'application/json',
               'Authorization': `Bearer ${token}`,
           },
           body: formData,
       });

       if (!imageResponse.ok) {
           throw new Error('Failed to upload image');
       }

       // Get the response which should include the image path
       const responseData = await imageResponse.json();
       console.log('Image uploaded, server path:', responseData.image_path);
       
       // The image URL would be something like:
       // http://192.168.0.101:8000/m/images/[generated-uuid].jpg
       const imageUrl = responseData.image_url; // Assuming your server returns this

       // Store or use the image URL as needed
       setIsVerified(true);
       onVerificationComplete(imageUrl);
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