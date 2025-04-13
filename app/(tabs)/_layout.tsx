import { View, Text, Image } from 'react-native'
import React from 'react'
import {Tabs, Redirect} from 'expo-router';
import { icons } from '../../constants';

const TabIcon = ({ icon, color, name, focused }) =>{
  return(
    <View className='items-center justify-center gap-2 w-12 top-4'>
      <Image
        source={icon}
        resizeMode="contain"
        tintColor={color}
        className='w-6 h-6'
      />
      <Text className={`${focused ? 'font-psemibold' : 'font-pregular'} text-xs`}>
        {name}
      </Text>
    </View>
  )
}

const TabsLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
            tabBarShowLabel:false,
            tabBarActiveTintColor:'#8A2BE2',
            tabBarInactiveTintColor:'#6F6F9D',
            tabBarStyle:{
              backgroundColor:'#F2F2F2',
              borderTopWidth: 1,
              borderTopColor: '#FFFFFF',
              height:84,
            }
        }}
      >
        <Tabs.Screen 
          name="home"
          options={{
            title: 'Home',
            headerShown: false,
            tabBarIcon: ({color, focused}) => (
                <TabIcon
                  icon={icons.home}
                  color={color}
                  name = "Home"
                  focused={focused}
                />
            )
          }}
        />
        <Tabs.Screen 
          name="profile"
          options={{
            title: 'Proile',
            headerShown: false,
            tabBarIcon: ({color, focused}) => (
                <TabIcon
                  icon={icons.profile}
                  color={color}
                  name = "Profile"
                  focused={focused}
                />
            )
          }}
        />
  
      </Tabs>
    </>
  )
}

export default TabsLayout