import React from 'react';

const AuthNContext = React.createContext();

class AuthNProvider extends React.Component {
    state = {
        isAuthenticated: false,
        userName: '',
        firstName: '',
        lastName: ''
    };

    constructor(props) {
        super(props);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
    }

    login() {
        this.setState({
            isAuthenticated: true,

        });
    }
    logout() {
        this.setState({isAuthenticated: false});
    }

    render() {
        return (
            <AuthNContext.Provider 
                value={{
                    isAuthenticated: this.state.isAuthenticated,
                    login: this.login,
                    logout: this.logout,
                    userName: '',
                    firstName: '',
                    lastName: ''}}>
                {this.props.children}
            </AuthNContext.Provider>
        )
    }
}

const AuthNConsumer = AuthNContext.Consumer;
export { AuthNProvider, AuthNConsumer};