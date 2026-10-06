import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>

      <Text style={styles.emoji}>🐾</Text>

      <Text style={styles.title}>
        PetWalk
      </Text>

      <Text style={styles.subtitle}>
        Paseos más seguros y organizados para tus mascotas
      </Text>

      <Text style={styles.question}>
        ¿Cómo quieres ingresar?
      </Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>
          🐶 Soy propietario
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>
          🦮 Soy paseador
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#EAF7F4',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
  },

  emoji: {
    fontSize: 70,
    marginBottom: 10,
  },

  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#2E7D6E',
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    color: '#555',
    marginBottom: 40,
  },

  question: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },

  button: {
    width: '90%',
    backgroundColor: '#2E7D6E',
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
  },

  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },

});
