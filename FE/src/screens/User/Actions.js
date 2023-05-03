import { StyleSheet, View } from "react-native";
import UserButton from "../../components/UserButton";
import { useNavigation } from "@react-navigation/native";
import { droptTable } from "../../data/user";
import { useContext } from "react";
import { AuthContext } from "../../providers/AuthProvider";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { unregisterLocationTask } from "../../utils/locationTask";

export default function Actions() {
  const navigation = useNavigation();
  const { setAuthUser } = useContext(AuthContext);
  const handleSync = () => {};

  const handleSignOut = async () => {
    droptTable("auth_users");
    setAuthUser(null);
    if (GoogleSignin.isSignedIn) {
      await GoogleSignin.signOut();
    }
    unregisterLocationTask();
    droptTable("locations");
    navigation.push("Login");
  };
  return (
    <View style={styles.container}>
      <UserButton content={"Đồng bộ"} onPress={handleSync} />
      <UserButton content={"Đăng xuất"} onPress={handleSignOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: "4%",
    height: 160,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
});
