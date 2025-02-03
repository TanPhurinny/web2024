const { Alert, Card, Button, Table, Form } = ReactBootstrap;

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDudUjW2t-V0HTCMDo2E5daZLw8G5_Fu0Q",
  authDomain: "web2567-411dc.firebaseapp.com",
  projectId: "web2567-411dc",
  storageBucket: "web2567-411dc.firebasestorage.app",
  messagingSenderId: "1035984013152",
  appId: "1:1035984013152:web:f6a5e0d9fc3d1b52d84005",
  measurementId: "G-TTDGFYZ8KX"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      students: [],
      user: null,
      stdid: "",
      stdtitle: "",
      stdfname: "",
      stdlname: "",
      stdemail: "",
      stdphone: "",
    };
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user: user.toJSON() });
      } else {
        this.setState({ user: null });
      }
    });
  }

  google_login = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");

    firebase.auth().signInWithPopup(provider)
      .then((result) => console.log("Login Success:", result.user))
      .catch((error) => console.error("Login Failed:", error.message));
  };

  google_logout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      firebase.auth().signOut();
    }
  };

  readData = () => {
    db.collection("students").get().then((querySnapshot) => {
      let stdlist = [];
      querySnapshot.forEach((doc) => {
        stdlist.push({ id: doc.id, ...doc.data() });
      });
      this.setState({ students: stdlist });
    });
  };

  autoRead = () => {
    db.collection("students").onSnapshot((querySnapshot) => {
      let stdlist = [];
      querySnapshot.forEach((doc) => {
        stdlist.push({ id: doc.id, ...doc.data() });
      });
      this.setState({ students: stdlist });
    });
  };

  insertData = () => {
    db.collection("students")
      .doc(this.state.stdid)
      .set({
        title: this.state.stdtitle,
        fname: this.state.stdfname,
        lname: this.state.stdlname,
        phone: this.state.stdphone,
        email: this.state.stdemail,
      })
      .then(() => {
        alert("บันทึกข้อมูลสำเร็จ");
        this.setState({ stdid: "", stdtitle: "", stdfname: "", stdlname: "", stdemail: "", stdphone: "" });
      })
      .catch((error) => alert("เกิดข้อผิดพลาด: " + error.message));
  };

  edit = (std) => {
    this.setState({
      stdid: std.id,
      stdtitle: std.title,
      stdfname: std.fname,
      stdlname: std.lname,
      stdemail: std.email,
      stdphone: std.phone,
    });
  };

  delete = (std) => {
    if (window.confirm("ต้องการลบข้อมูลนี้หรือไม่?")) {
      db.collection("students").doc(std.id).delete()
        .then(() => alert("ลบข้อมูลสำเร็จ"))
        .catch((error) => alert("เกิดข้อผิดพลาด: " + error.message));
    }
  };

  render() {
    return (
      <Card>
        <Card.Header>
          <Alert variant="info">
            <b>Work6 :</b> Firebase Authentication & Firestore
          </Alert>
        </Card.Header>
        <Card.Body>
          <LoginBox user={this.state.user} app={this} />
          <div className="d-flex flex-wrap mt-3">
            <Button variant="primary" className="m-2" onClick={this.readData}>📖 Read Data</Button>
            <Button variant="info" className="m-2" onClick={this.autoRead}>🔄 Auto Read</Button>
          </div>
          <StudentTable data={this.state.students} app={this} />
        </Card.Body>
        <Card.Footer>
          <b>เพิ่ม/แก้ไขข้อมูล นักศึกษา :</b>
          <Form>
            <TextInput label="ID" app={this} value="stdid" />
            <TextInput label="คำนำหน้า" app={this} value="stdtitle" />
            <TextInput label="ชื่อ" app={this} value="stdfname" />
            <TextInput label="สกุล" app={this} value="stdlname" />
            <TextInput label="Email" app={this} value="stdemail" />
            <TextInput label="Phone" app={this} value="stdphone" />
            <Button variant="success" className="m-2" onClick={this.insertData}>💾 Save</Button>
          </Form>
        </Card.Footer>
        <Card.Footer>
          By 663380181-3 Phurin Suwachat <br />
          College of Computing, Khon Kaen University
        </Card.Footer>
      </Card>
    );
  }
}

function LoginBox({ user, app }) {
  return !user ? (
    <Button variant="success" className="m-2" onClick={app.google_login}>🔑 Login with Google</Button>
  ) : (
    <div>
      <img src={user.photoURL || "https://via.placeholder.com/50"} alt="User Avatar" width="50" height="50" className="rounded-circle me-2" />
      {user.email}
      <Button variant="danger" className="m-2" onClick={app.google_logout}>🚪 Logout</Button>
    </div>
  );
}

function StudentTable({ data, app }) {
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>รหัส</th>
          <th>คำนำหน้า</th>
          <th>ชื่อ</th>
          <th>สกุล</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {data.map((s) => (
          <tr key={s.id}>
            <td>{s.id}</td>
            <td>{s.title}</td>
            <td>{s.fname}</td>
            <td>{s.lname}</td>
            <td>{s.email}</td>
            <td>{s.phone}</td>
            <td>
              <EditButton std={s} app={app} />
              <DeleteButton std={s} app={app} />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function EditButton({ std, app }) {
  return <Button variant="warning" size="sm" className="m-2" onClick={() => app.edit(std)}>✏️ แก้ไข</Button>;
}

function DeleteButton({ std, app }) {
  return <Button variant="danger" size="sm" className="m-2" onClick={() => app.delete(std)}>🗑️ ลบ</Button>;
}

function TextInput({ label, app, value }) {
  return (
    <Form.Group>
      <Form.Label>{label}:</Form.Label>
      <Form.Control type="text" value={app.state[value]} onChange={(ev) => app.setState({ [value]: ev.target.value })} />
    </Form.Group>
  );
}

const container = document.getElementById("myapp");
const root = ReactDOM.createRoot(container);
root.render(<App />);
