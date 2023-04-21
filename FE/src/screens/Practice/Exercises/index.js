import React, { useState, useEffect } from "react";
import { View, Button, TextInput, ScrollView, TouchableOpacity } from "react-native";
import { SearchBar } from "react-native-elements";
import { StyleSheet } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import {closeCircle} from "react-native-vector-icons/AntDesign";
import Fillter from "./Fillter";
import Item from "./Item";
import { SCREEN_HEIGHT } from "../../../constants/size";
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import { AntDesign } from "@expo/vector-icons";
import { useRef } from 'react';

export default function Exercises() {
  const [exercises, setExercises] = useState(null);
  const [targets, setTargets] = useState(null);
  const [bodyparts, setBodyparts] = useState(null);
  const [selectedTargets, setSelectedTargets] = useState([]);
  const [selectedBodyparts, setSelectedBodyparts] = useState([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef();

  console.log(exercises?.length);

  useEffect(() => {
    const getData = async () => {
      let exercisesData = await axios.get('http://10.0.2.2:5000/videos/all', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      let targetsData = await axios.get('http://10.0.2.2:5000/targets', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      let bodypartsData = await axios.get('http://10.0.2.2:5000/bodyparts', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      setTargets(targetsData.data.data);
      setBodyparts(bodypartsData.data.data);
      setExercises(exercisesData.data.data);
    }
    getData();
  }, [])

  const handleSearch = async () => {
    let results = await axios.get('http://10.0.2.2:5000/videos/all', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        params: {
          targets: JSON.stringify(selectedTargets),
          bodyparts: JSON.stringify(selectedBodyparts),
          input: input,
        }
      });
      console.log(results.data.data.length);
      setExercises(results.data.data);
      scrollRef.current?.scrollTo({
        y: 0,
        animated: true,
      });
  }

  //console.log(exercises);

  if(targets && bodyparts && exercises) {
    return (
      <View style={styles.container} onLayout={() => {SplashScreen.hideAsync();}}>
        <View style={styles.search}>
          <TextInput
          style = {styles.input}
          placeholder = "Search"
          placeholderTextColor = "rgba(255, 162, 57, 1)"
          defaultValue={input}
          onChangeText={newText => setInput(newText)}
          />
          <TouchableOpacity style={styles.button} onPress={(e) => {
            if(targets.length == 0 && bodyparts.length == 0 && input=="") {
              return
            } else {
              handleSearch();
            }
          }}>
            <AntDesign
            name="search1"
            size={30}
            color={"white"}
            />
          </TouchableOpacity>
        </View>
        <View style={{...styles.fillters}}>
          <Fillter data={targets} setSelected={setSelectedTargets} selected={selectedTargets}/>
          <Fillter data={bodyparts} setSelected={setSelectedBodyparts} selected={selectedBodyparts}/>
        </View>
        <ScrollView style={styles.list} disableScrollViewPanResponder={true}
        showsVerticalScrollIndicator={false} ref={scrollRef}>
          {exercises.map((element, index) => (
            <Item key={index} data={element}/>
          ))}
        </ScrollView>
      </View>
  );
  } else {
    return (
      <View style={styles.container} onLayout={() => {SplashScreen.hideAsync();}}>
        <Spinner
          //visibility of Overlay Loading Spinner
          visible={true}
          //Text with the Spinner
          textContent={'Loading...'}
          //Text style of the Spinner Text
          textStyle={styles.spinnerTextStyle}
        />
      </View>
  );
  }
}

const styles = StyleSheet.create({
  container : {
    marginTop: "5%",
  },
  input : {
    height: 40,
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 30,
    backgroundColor: "rgba(226, 221, 221, 1)",
    color: "rgba(255, 162, 57, 1)",
    width: "85%",
    marginHorizontal: '1%'
  },
  fillters : {
    borderRadius: 10,
    paddingHorizontal: 10,
    marginVertical: 15,
  },
  list : {
    height: SCREEN_HEIGHT - 50 - 48 - 20 - 60 - 140,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  search: {
    display: 'flex',
    flexDirection: 'row',
    marginHorizontal: "5%",
  },
  button: {
    borderRadius: 30,
    overflow: "hidden",
    padding: 6,
    backgroundColor: "rgba(255, 162, 57, 1)"
  }
})