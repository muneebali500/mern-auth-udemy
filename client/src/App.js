import Layout from "./core/Layout";

export default function App() {
  return (
    <Layout>
      <div className="col-md-6 offset-md-3 text-center">
        <h1 className="p-5">React Node MongoDB Authentication Biolerplate</h1>
        <h2>MERN STACK</h2>
        <hr />
        <p className="lead">
          MERN Stack login register system with account activation, login with
          facebook and google as well as private and protected routes for
          autheticated user and users with the role of admin.
        </p>
      </div>
    </Layout>
  );
}
