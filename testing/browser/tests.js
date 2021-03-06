let email = window.localStorage.email
let password = window.localStorage.password

if (!email) {
   email = prompt("Enter test email", ""); 
   window.localStorage.email = email
}

if (!password) {
    password = prompt("Enter test password", "");
    window.localStorage.password = password
}

let currentSession = prompt("Test current session? Leave blank for new session.")

let im = Immuto.init(true, "http://localhost:8000")

async function run_tests() {
    await im.deauthenticate()// ensure user not logged in to start tests

    try {
        let testResult = await establish_connection_tests()
        im.connected = false
        if (testResult) console.log("Parallel connection attempts successful!");
    } catch (err) {
        console.error("Error during parallel connection attempts")
        console.error(err)
    }
    
    try {
        await im.authenticate(email, password)
    } catch (err) {
        console.error("Failed to authenticate")
        console.error(err)
    }
    
    try {
        testResult = await data_management_tests()
        if (testResult === true) {
            console.log("Data management tests successful!")
        } else {
            console.error(testResult)
        }
    } catch (err) {
        console.error("Failed data management tests")
        console.error(err)
    }
   

    try {
        im.connected = false // test auto connection before record verification
        testResult = await data_management_tests()
        if (testResult === true) {
            console.log("Data management (with auto connect) tests successful!");
        } else {
            console.error(testResult)
        }
    } catch (err) {
        console.error("Failed data management tests (with auto connect)")
        console.error(err)
    }
    

    try {
        testResult = await digital_agreement_tests()
        if (testResult === true) {
            console.log("Digital agreement tests successful!");
        } else {
            console.error(testResult)
        }
    } catch (err) {
        console.error("Failed digital agreement tests")
        console.error(err)
    }

    try {
        im.connected = false // test auto connection before record verification
        testResult = await digital_agreement_tests()
        if (testResult === true) {
            console.log("Digital agreement (with auto connect) tests successful!");
        } else {
            console.error(testResult)
        }
    } catch (err) {
        console.error("Failed digital agreement tests (with auto connect)")
        console.error(err)
    }
}


// parallel requests should all be successful, including automatic from attempt connection
function establish_connection_tests() {
    return new Promise((resolve, reject) => {
        let successCount = 0
        im.establish_connection(email).then(() => {
            successCount ++;
            if (successCount == 3) {
                resolve(true)
            }
        }).catch((err) => {
            reject(err)
        })
        im.establish_connection(email).then(() => {
            successCount ++;
            if (successCount == 3) {
                resolve(true)
            }
        }).catch((err) => {
            reject(err)
        })
        im.establish_connection(email).then(() => {
            successCount ++;
            if (successCount == 3) {
                resolve(true)
            }
        }).catch((err) => {
            reject(err)
        })
    })
}

async function data_management_tests() {
    let content = "EXAMPLE CONTENT"
    let recordName = "A Record"
    let type = "basic" // alternatively, could be 'editable'
    let desc = "Record Description" // optional

    try {
        let recordID = await im.create_data_management(content, recordName, type, password, desc)
        let verified = await im.verify_data_management(recordID, type, content)

        if (verified) {
            return true
        } else {
            return "Verification failed for data management"
        }
    } catch(err) {
        return err
    }
}

async function digital_agreement_tests() {
    let content = "EXAMPLE CONTENT"
    let recordName = "A Record"
    let type = "single_sign" // alternatively, could be 'editable'
    let desc = "Record Description" // optional

    try {
        let recordID = await im.create_digital_agreement(content, recordName, type, password, [], desc)
        let verified = await im.verify_digital_agreement(recordID, type, content)
        
        if (verified) {
            return true
        } else {
            return "Verification failed for digital agreement"
        }
    } catch(err) {
        return err
    }
}
