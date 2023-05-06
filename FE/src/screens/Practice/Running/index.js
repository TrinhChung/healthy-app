import { StyleSheet, View } from "react-native";
import Actions from "./Actions";
import Info from "./Info";
import runningInfo from "../../../assets/fakeDatas/runningInfo";
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from "react-native-maps";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  FOOTERBAR_HEIGHT,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  STATUSBAR_HEIGHT,
} from "../../../constants/size";
import * as Location from "expo-location";
import {
  LOCATION_TASK_NAME,
} from "../../../utils/locationTask";
import {
  createTableLocations,
  getTheRunningLocation,
  insertLocation,
} from "../../../data/locations";
import {
  createTableRunningInfos,
  getTheLastRunningInfo,
  insertRunningInfo,
} from "../../../data/runningInfo";
import { convertTime } from "../../../utils/datetime";
import * as TaskManager from "expo-task-manager";
import { handleGetBMI } from "../../../services/bmi";
import { burnedCalorineByRunning } from "../../../utils/caculateCalorine";

export default function Running() {
  const [defaultRunningInfo, setDefaultRunningInfo] = useState(runningInfo);
  const [nowLocation, setNowLocation] = useState();
  const [bmi, setBmi] = useState();

  const [subscription, setSubscription] = useState(null);
  const useForceUpdate = () => {
    const [, setState] = useState();
    return () => setState({});
  };

  const forceUpdate = useForceUpdate();
  const path = useRef(0);

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  const getPath = async () => {
    if (defaultRunningInfo?.id) {
      const theLocation = await getTheRunningLocation(defaultRunningInfo.id);
      if (theLocation.length > 0) {
        path.current = theLocation;

        const speed =
          Number.parseFloat(theLocation[theLocation.length - 1].speed).toFixed(
            3,
          ) + "m/s";
        const duration = convertTime(theLocation.length * 1000);
        const distance = Number.parseFloat(
          theLocation.reduce((sum, location) => sum + location.speed, 0) / 1000,
        ).toFixed(2);
        const calo = Number.parseFloat(
          burnedCalorineByRunning(
            bmi?.weight || 50,
            theLocation.reduce((sum, location) => sum + location.speed, 0) /
              1000,
          ),
        ).toFixed(3);
        setDefaultRunningInfo((prev) => {
          return {
            ...prev,
            speed,
            duration,
            distance,
            calo,
          };
        });
      }
    }
  };

  const forceUpdateLocations = () => {
    getPath();
    forceUpdate();
  };

  const _subscribe = async () => {
    setSubscription(
      TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
        if (data) {
          const { locations } = data;

          if (
            locations[0].coords.speed >= 0.08333 &&
            locations[0].coords.speed <= 0.33333
          ) {
            await insertLocation({
              ...locations[0].coords,
              runningInfoId: defaultRunningInfo.id,
            });
            forceUpdateLocations();
          }

          return;
        }
        if (error) {
          console.log("task error:", error);
          return;
        }
      }),
    );
  };

  useEffect(() => {
    createTableLocations();
    createTableRunningInfos();
    getRunningInfo();
    getPath();
    getNowLocation();
    getBMI();
  }, []);

  useEffect(() => {
    if (defaultRunningInfo.isStarted) {
      _subscribe();
      startBackgroundTracking();
    }

    return () => _unsubscribe();
  }, [defaultRunningInfo]);

  const startBackgroundTracking = async () => {
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.LocationAccuracy.BestForNavigation,
      timeInterval: 1000,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: "Title",
        notificationBody: "This is body!",
        notificationColor: "#AA1111",
      },
      deferredUpdatesInterval: 100,
      activityType: Location.ActivityType.AutomotiveNavigation,
    });
  };

  const getPermissions = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      console.log("Hãy cho phép ứng dụng lấy thông tin vị trí của bạn!");
      return;
    }
  };

  const getBMI = async () => {
    const bmiRes = await handleGetBMI();
    if (bmiRes.success) {
      setBmi(bmiRes.data);
    }
  };

  const getRunningInfo = async () => {
    const res = await getTheLastRunningInfo();
    const [rI] = res;
    if (rI) {
      setDefaultRunningInfo({
        ...defaultRunningInfo,
        ...rI,
      });
    }
  };

  const getNowLocation = async () => {
    const currentPermission = await Location.getForegroundPermissionsAsync();
    if (currentPermission.granted) {
      const location = await Location.getCurrentPositionAsync();
      setNowLocation(location.coords);
    }
  };

  const handleChangeTarget = (newTarget) => {
    setDefaultRunningInfo((prev) => {
      return {
        ...prev,
        target: newTarget,
      };
    });
  };

  const handleStartRunning = async () => {
    if (!defaultRunningInfo.isStarted) {
      getPermissions();
      if (!nowLocation) {
        await getNowLocation();
      }
      await insertRunningInfo({
        target: defaultRunningInfo.target,
        isStarted: true,
      });
      await getRunningInfo();
    }
  };

  const handleStopRunning = () => {
    path.current = [];
    setDefaultRunningInfo({
      ...runningInfo,
      isStopped: 0,
    });
  };

  return (
    <View>
      <LinearGradient
        colors={["rgba(0, 0, 0, 0.4)", "transparent"]}
        style={[
          styles.content,
          {
            zIndex:
              defaultRunningInfo.target && defaultRunningInfo.isStarted ? 1 : 2,
          },
        ]}
      >
        <Actions
          target={defaultRunningInfo.target}
          isStarted={defaultRunningInfo.isStarted}
          isStopped={defaultRunningInfo.isStopped}
          onChangeInput={handleChangeTarget}
          onStart={handleStartRunning}
        />
      </LinearGradient>
      <View style={{ zIndex: 3, marginHorizontal: "2%" }}>
        <View style={styles.info}>
          <Info info={defaultRunningInfo} onStop={handleStopRunning} />
        </View>
      </View>
      <View style={[styles.content, styles.mapContainer]}>
        {nowLocation && (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: nowLocation.latitude,
              longitude: nowLocation.longitude,
              latitudeDelta: 0,
              longitudeDelta: 0,
            }}
            provider={PROVIDER_GOOGLE}
          >
            <Marker
              title="Xuất phát"
              pinColor="blue"
              coordinate={
                path.current[0] || {
                  latitude: nowLocation.latitude,
                  longitude: nowLocation.longitude,
                }
              }
            />
            <Polyline
              coordinates={path.current || []}
              strokeWidth={6}
              strokeColor={"orange"}
            />
            <Marker
              title="Hiện tại"
              pinColor="red"
              coordinate={
                path.current[path.current.length - 1] || {
                  latitude: nowLocation.latitude,
                  longitude: nowLocation.longitude,
                }
              }
            />
          </MapView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    height: SCREEN_HEIGHT - STATUSBAR_HEIGHT - 48 - 20 - FOOTERBAR_HEIGHT,
    display: "flex",
    flexDirection: "column",
    marginTop: 20,
    marginHorizontal: "2%",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 10,
    position: "relative",
    justifyContent: "center",
  },
  info: {
    position: "absolute",
    bottom: 0,
    width: SCREEN_WIDTH - (SCREEN_WIDTH / 100) * 4,
  },
  map: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  mapContainer: {
    backgroundColor: "transparent",
    position: "absolute",
    width: SCREEN_WIDTH - (SCREEN_WIDTH / 100) * 4,
    zIndex: 1,
  },
});
