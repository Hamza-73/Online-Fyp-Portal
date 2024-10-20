import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';

export default function PrivateRoute() {
    const [currentUser, setCurrentUser] = useState('');
    useEffect(() => {
        const userData = Cookies.get('userData');
        console.log("All cookies: is", Cookies.get());
        if (userData) {
            try {
                const parsedData = JSON.parse(userData);
                setCurrentUser(parsedData.username);
            } catch (error) {
                console.error('Error parsing cookie:', error);
            }
        }
    }, []);
    // console.log("private user ", currentUser)
    return currentUser ? <Outlet /> : <Navigate to='/login' />
}
