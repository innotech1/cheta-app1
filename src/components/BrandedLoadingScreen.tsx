import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function BrandedLoadingScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Chetá</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 28,
  },
  title: {
    marginTop: 16,
    fontSize: 28,
    fontWeight: '800',
    color: colors.accent,
  },
});
