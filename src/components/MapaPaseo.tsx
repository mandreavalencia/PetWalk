import { useEffect, useRef } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Colores } from "../constants/colores";
import { Coord } from "../services/walkService";

type Props = {
  ruta: Coord[];
  modo?: "vivo" | "resumen";
  style?: ViewStyle;
};

export default function MapaPaseo({ ruta, modo = "vivo", style }: Props) {
  const mapRef = useRef<MapView>(null);
  const primero = ruta[0];
  const ultimo = ruta[ruta.length - 1];

  const ajustar = () => {
    if (!ultimo) return;
    if (modo === "vivo") {
      mapRef.current?.animateToRegion(
        { ...ultimo, latitudeDelta: 0.004, longitudeDelta: 0.004 },
        500
      );
    } else if (ruta.length > 1) {
      mapRef.current?.fitToCoordinates(ruta, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: false,
      });
    }
  };

  useEffect(ajustar, [ruta.length, modo]);

  if (!primero) return null;

  return (
    <View style={[styles.caja, style]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={{ ...primero, latitudeDelta: 0.004, longitudeDelta: 0.004 }}
        showsUserLocation={modo === "vivo"}
        onMapReady={ajustar}
      >
        {ruta.length > 1 && (
          <Polyline coordinates={ruta} strokeColor={Colores.primario} strokeWidth={5} />
        )}
        <Marker coordinate={primero} title="Inicio" pinColor="green" />
        {modo === "resumen" && ruta.length > 1 && (
          <Marker coordinate={ultimo} title="Fin" pinColor="red" />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  caja: { height: 340, borderRadius: 15, overflow: "hidden" },
});