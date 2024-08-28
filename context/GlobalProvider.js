import React, { createContext, useContext, useEffect, useState } from "react";


const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const getCurrentUser = async () => {
    // try {
    //   // Replace this URL with the endpoint for your authentication service
    //   const response = await fetch('/api/current-user', {
    //     method: 'GET',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       // Add authentication token if needed
    //       'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    //     },
    //   });
  
    //   if (!response.ok) {
    //     // Handle server errors or authentication issues
    //     throw new Error('Failed to fetch user data');
    //   }
  
    //   const user = await response.json();
  
    //   // Return the user data if the response is valid
    //   return user;
    // } catch (error) {
    //   console.error('Error fetching current user:', error);
    //   // Return null if there's an error or if the user is not authenticated
    //   return null;
    // }

    return "anya"
  };

const GlobalProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        if (res) {
          setIsLogged(true);
          setUser(res);
          console.log(res);
        } else {
          setIsLogged(false);
          setUser(null);
        }
      })
      .catch((error) => {
        console.log(error);
      })
    //   .finally(() => {
    //     setLoading(false);
    //   });
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        isLogged,
        setIsLogged,
        user,
        setUser,
        // loading,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;