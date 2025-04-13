import { ScrollView, Text, View, Image } from "react-native";
import { Redirect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from '../constants'
import CustomButton from "@/components/CustomButton";
import React from "react";

export default function Index() {
  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView contentContainerStyle={{ height:'100%'}}>
        <View className="w-full flex justify-center items-center min-h-[85vh] px-4">
        <Image
          source={images.logo}
          className = "w-[130px] h-[84px]"
          resizeMode="contain"
        />

        <Image
          source={images.cards}
          className="max-w-[400px] w-fll h-[400px]"
          resizeMode="contain"
        />

        <View className="relative mt-5">
          <Text className="text-3xl text-black font-bold text-center">
            Discover Endless Possibilities with {''}
            <Text className="text-secondary">Watch4u</Text>
          </Text>
        </View>
        <Text className="text-sm font-pregular text-gray-600 mt-7 text-center">Where creativity meets innovation: embark on a journey of limitless expoloration with Watch4u</Text>
        <CustomButton
          title = "Continue with Student Email"
          handlePress = { () => router.push('/sign-in')}
          containerStyles="w-full mt-7"
        />
       </View>

      </ScrollView>
    </SafeAreaView>
  );
}
