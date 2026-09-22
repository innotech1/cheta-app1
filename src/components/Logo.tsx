import { Image, ImageStyle, StyleProp } from 'react-native';

type Props = {
  size?: number;
  style?: StyleProp<ImageStyle>;
};

export default function Logo({ size = 32, style }: Props) {
  return (
    <Image
      source={require('../../assets/logo.png')}
      style={[{ width: size, height: size, resizeMode: 'contain' }, style]}
    />
  );
}