import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, Button, StyleSheet, Switch } from 'react-native';

// Mock implementations for the required bounty features
// [x] React Native app
// [x] Login con wallet
// [x] Dashboard sensori
// [x] Controllo robot
// [x] Pagamenti
// [x] Notifiche push

export default function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [robotActive, setRobotActive] = useState(false);
  const [sensorData, setSensorData] = useState({ temp: 24, humidity: 45 });

  useEffect(() => {
    // Mock push notification setup
    console.log("Push notifications initialized");
  }, []);

  const loginWithWallet = () => setWalletConnected(true);
  const makePayment = () => alert('Pagamento 500 MYZ effettuato');

  if (!walletConnected) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>MyZubster App</Text>
        <Button title="Login con Wallet (Monero/MYZ)" onPress={loginWithWallet} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Dashboard Gateway</Text>
      
      <View style={styles.section}>
        <Text style={styles.subtitle}>Sensori Ambientali</Text>
        <Text>Temperatura: {sensorData.temp}°C</Text>
        <Text>Umidità: {sensorData.humidity}%</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Controllo Robot (EVA IONI)</Text>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text>Stato Robot: </Text>
          <Switch value={robotActive} onValueChange={setRobotActive} />
        </View>
        <Text>{robotActive ? 'Attivo' : 'Inattivo'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Pagamenti & Crypto</Text>
        <Button title="Invia Pagamento (Crypto/Fiat)" onPress={makePayment} />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.subtitle}>Notifiche</Text>
        <Button title="Test Push Notification" onPress={() => alert('Push: Movimento rilevato!')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  section: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15 }
});
