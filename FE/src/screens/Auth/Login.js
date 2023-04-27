import { StyleSheet, View } from "react-native";
import CustomText from "../../components/CustomText";
import UserButton from "../../components/UserButton";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../constants/size";
import Layout from "../../layouts/Layout";
import {
  GoogleSignin,
  GoogleSigninButton,
} from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";
import { useEffect } from "react";

export default function Login({ navigation }) {
  const handleLoginViaFacebook = () => {
    navigation.push("BMISetting");
  };
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "398419276498-ieb7kgf5crp40npvuc6pf2ehcu3efja1.apps.googleusercontent.com",
    });
  }, []);
  async function onGoogleButtonPress() {
    // Check if your device supports Google Play
    //await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Get the users ID token
    const user = await GoogleSignin.signIn();
    console.log(user);
    // Create a Google credential with the token
  }

  const handleLoginViaGoogle = async () => {
    //navigation.push("Home");
    await onGoogleButtonPress();
  };
  return (
    <Layout isAuth={false}>
      <View style={styles.container}>
        <CustomText
          fontFamily="NunitoSans-Bold"
          style={[{ fontSize: 36, marginBottom: 100 }]}
        >
          ĐĂNG NHẬP
        </CustomText>
        <View style={styles.actions}>
          <UserButton
            onPress={handleLoginViaFacebook}
            content={"Đăng nhập bằng Facebooke"}
          />
          <UserButton
            onPress={handleLoginViaGoogle}
            content={"Đăng nhập bằng Google"}
          />
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    height: SCREEN_HEIGHT,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: (SCREEN_HEIGHT / 100) * 40,
  },
  actions: {
    height: 160,
    width: SCREEN_WIDTH - (SCREEN_WIDTH / 100) * 8,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
});