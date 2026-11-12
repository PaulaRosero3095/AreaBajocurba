import { SafeAreaProvider } from 'react-native-safe-area-context';
import AreaCurvaScreen from './src/screens/AreaCurvaScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <AreaCurvaScreen />
    </SafeAreaProvider>
  );
}