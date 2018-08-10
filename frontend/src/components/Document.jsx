import React from 'react';
import { Document, Page, Image, Text, View, StyleSheet } from '@react-pdf/renderer';
// Create styles
const styles = StyleSheet.create({
  page: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
  },
  section: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    height: 50,
    width: 100,
    marginBottom: 10,
  }
});

const AccDocument = (props) => {
  console.log(props, "sdlfjkd")
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {
          props.data.users.map((item) => (
              <View style={styles.section}>
                <Image
                  src={'/static/img/genesis_logo.png'}
                  style={styles.image}
                />
                <br/><br/>
                <Text>User ID : {item[0]}</Text>
                <Text>Password: {item[1]}</Text>
              </View>
          ))
        }
      </Page>
    </Document>
  );
}

export default AccDocument;