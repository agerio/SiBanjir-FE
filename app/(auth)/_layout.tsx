import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  console.log("app/(auth)/_layout.tsx")
  return (
    <Stack>
      <Stack.Screen name="signin" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
    </Stack>
  );
}
