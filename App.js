import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen       from './src/screens/HomeScreen';
import LancamentoScreen from './src/screens/LancamentoScreen';
import FuncionariosScreen from './src/screens/FuncionariosScreen';
import CadastroScreen   from './src/screens/CadastroScreen';
import DetalheScreen    from './src/screens/DetalheScreen';
import FechamentoScreen from './src/screens/FechamentoScreen';
import RelatoriosScreen from './src/screens/RelatoriosScreen';
import { CORES } from './src/components/theme';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const headerOpts = {
  headerStyle: { backgroundColor: CORES.primary },
  headerTintColor: '#FFF',
  headerTitleStyle: { fontWeight: '700', fontSize: 18 },
};

function Tabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      ...headerOpts,
      tabBarIcon: ({ focused, color, size }) => {
        const icons = {
          'Início':       focused ? 'home'         : 'home-outline',
          'Lançamento':   focused ? 'calendar'     : 'calendar-outline',
          'Funcionários': focused ? 'people'       : 'people-outline',
          'Fechamento':   focused ? 'cash'         : 'cash-outline',
        };
        return <Ionicons name={icons[route.name]} size={size} color={color} />;
      },
      tabBarActiveTintColor: CORES.primary,
      tabBarInactiveTintColor: '#999',
      tabBarStyle: { height: 64, paddingBottom: 8, paddingTop: 4 },
      tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
    })}>
      <Tab.Screen name="Início"       component={HomeScreen} />
      <Tab.Screen name="Lançamento"   component={LancamentoScreen} />
      <Tab.Screen name="Funcionários" component={FuncionariosScreen} />
      <Tab.Screen name="Fechamento"   component={FechamentoScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={headerOpts}>
        <Stack.Screen name="Main"       component={Tabs}            options={{ headerShown: false }} />
        <Stack.Screen name="Cadastro"   component={CadastroScreen}  options={{ title: 'Funcionário' }} />
        <Stack.Screen name="Detalhe"    component={DetalheScreen}   options={{ title: 'Detalhe do Lançamento' }} />
        <Stack.Screen name="Relatórios" component={RelatoriosScreen} options={{ title: 'Relatórios Mensais' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
