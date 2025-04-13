import { View, Text, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Stack } from 'expo-router';
import { NFCButton } from '../../components/NFCButton';
import { SelfieButton } from '../../components/SelfieButton';
import ProgressStepper from '../../components/ProgressStepper';
import { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CheckInScreen = () => {
    const params = useLocalSearchParams<{
        id: string;
        title: string;
        date: string;
        start_time: string;
        end_time: string;
        duration: string;
        room_name: string;
        room_location: string;
    }>();

    const [checkInProgress, setCheckInProgress] = useState(0);
    const [tagSerialNumber, setTagSerialNumber] = useState<string>('');
    const [isLoading, setIsLoading] = useState({
        nfc: false,
        selfie: false
    });
    const [showCamera, setShowCamera] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    
    useEffect(() => {
        const getUserId = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem('user_id');
                if (storedUserId) {
                    setUserId(storedUserId);
                } else {
                    console.error('No user ID found in storage');
                    // Optionally redirect to login
                    router.replace('/(tabs)/home');
                }
            } catch (error) {
                console.error('Error fetching user ID:', error);
                // Handle error appropriately
            }
        };

        getUserId();
    }, []);

    const handleNFCComplete = (serialNumber: string) => {
        setTagSerialNumber(serialNumber); // Store the serial number
        setCheckInProgress(0.5);
    };
    // Parse the room_name if it was stringified
    const parsedRoomName = params.room_name ? JSON.parse(params.room_name) : '';

    const handleNFCScan = async () => {
        setIsLoading(prev => ({ ...prev, nfc: true }));
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCheckInProgress(0.5);
        setIsLoading(prev => ({ ...prev, nfc: false }));
    };

    const handleSelfieComplete = (selfieUri: string) => {
        setCapturedImage(selfieUri);
        setCheckInProgress(1);
        setShowCamera(false);
    };

    return (
        <View className="flex-1 bg-primary p-6">
            <Stack.Screen options={{
                headerShown: true,
                headerTitle: 'Check-in',
                headerTitleAlign: 'center',
                headerStyle: { backgroundColor: '#FAFAFA' },
                headerTintColor: 'black',
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} className="ml-2">
                        <Ionicons name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>
                ),
            }} />

            <View className="flex-1">
                <View className="mt-4">
                    <Text className="text-xl font-pmedium text-center text-gray-700 mb-4">
                        {params.title}
                    </Text>
                    <ProgressStepper
                        progress={checkInProgress}
                        steps={['NFC Verify', 'Selfie', 'Complete']}
                        activeColor="#8A2BE2"
                        inactiveColor="#E5E7EB"
                    />
                </View>

                {/* Dynamic Content Area */}
                <View className="flex-1">
                    {checkInProgress === 0 && (
                        <View className="flex-1 justify-center px-4">
                            <Text className="text-lg text-center text-gray-900">
                                Please scan the NFC tag on your top-right corner of the table.
                            </Text>
                        </View>
                    )}

                    {checkInProgress === 0.5 && showCamera && (
                        <View className="flex-1">
                            <SelfieButton
                                isActive={true}
                                examId={params.id}
                                userId={userId}
                                tagSerialNumber={tagSerialNumber}
                                onVerificationComplete={handleSelfieComplete}
                                onError={(error) => console.error(error)}
                            />
                        </View>
                    )}

                    {checkInProgress === 0.5 && !showCamera && (
                        <View className="flex-1 justify-center px-4">
                            <View className="bg-white p-6 rounded-lg">
                                <Text className="text-lg text-center text-gray-800 mb-4">
                                    Take a clear selfie for attendance verification
                                </Text>
                                <TouchableOpacity
                                    className="border-2 border-dashed border-secondary rounded-lg p-4 items-center"
                                    onPress={() => setShowCamera(true)}
                                >
                                    <Ionicons name="camera" size={40} color="#8A2BE2" />
                                    <Text className="text-gray-500 mt-2">Tap to open camera</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {checkInProgress === 1 && (
                        <View className="flex-1 justify-center px-4">
                            <View className="bg-green-100 p-6 rounded-lg items-center">
                                <Text className="text-xl font-bold text-green-800">
                                    Check-in Complete!
                                </Text>
                                <Text className="text-center mt-2">
                                    You're checked in for {params.title} at {params.room_location}
                                </Text>
                                {capturedImage && (
                                    <Image
                                        source={{ uri: capturedImage }}
                                        style={{
                                            width: 128,
                                            height: 128,
                                            borderRadius: 64,
                                            marginTop: 16,
                                            borderWidth: 2,
                                            borderColor: '#8A2BE2'
                                        }}
                                    />
                                )}
                            </View>
                        </View>
                    )}
                </View>

                {/* Bottom Buttons */}
                {checkInProgress < 1 && (
                    <View className="space-y-4 mb-6">
                        {checkInProgress < 0.5 && userId && (
                            <NFCButton
                                onVerificationComplete={() => setCheckInProgress(0.5)}
                                onSerialComplete={handleNFCComplete}
                                onError={(error) => console.error(error)} examId={params.id}  userId={userId}                         />
                        )}
                        {checkInProgress === 0.5 && !showCamera && (
                            <TouchableOpacity
                                className="bg-secondary py-3 rounded-lg items-center"
                                onPress={() => setShowCamera(true)}
                            >
                                <Text className="text-white">Take Selfie</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
};

export default CheckInScreen;