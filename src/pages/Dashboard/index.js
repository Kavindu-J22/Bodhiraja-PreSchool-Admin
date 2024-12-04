import React, { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { PiStudentFill } from "react-icons/pi";
import { GiTeacher } from "react-icons/gi";
import { db } from '../../firebase'; // assuming this is your Firebase configuration
import { collection, onSnapshot } from "firebase/firestore"; // Import Firestore methods
import { Bar, Pie } from 'react-chartjs-2'; // Import charts from react-chartjs-2
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'; // Required for chart.js

// Register the necessary chart elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
    const [studentCount, setStudentCount] = useState(0);
    const [teacherCount, setTeacherCount] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);

    useEffect(() => {
        // Real-time listener for students collection
        const unsubscribeStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
            const studentsTotal = snapshot.size;
            setStudentCount(studentsTotal);
            setTotalUsers(studentsTotal + teacherCount); // Update total users
        });

        // Real-time listener for teachers collection
        const unsubscribeTeachers = onSnapshot(collection(db, 'teachers'), (snapshot) => {
            const teachersTotal = snapshot.size;
            setTeacherCount(teachersTotal);
            setTotalUsers(teachersTotal + studentCount); // Update total users
        });

        // Cleanup the listeners on component unmount
        return () => {
            unsubscribeStudents();
            unsubscribeTeachers();
        };
    }, [studentCount, teacherCount]);

    // Data for Bar Chart
    const barChartData = {
        labels: ['Students', 'Teachers', 'Total Users'],
        datasets: [
            {
                label: 'User Count',
                data: [studentCount, teacherCount, totalUsers],
                backgroundColor: ['#28a745', '#007bff', '#ffc107'], // Colors for each bar
            },
        ],
    };

    // Data for Pie Chart
    const pieChartData = {
        labels: ['Students', 'Teachers'],
        datasets: [
            {
                data: [studentCount, teacherCount],
                backgroundColor: ['#28a745', '#007bff'],
                borderColor: ['#fff', '#fff'],
                borderWidth: 1,
            },
        ],
    };

    return (
        <>
            <div className="right-content w-100">

                
                <div className="dashboardBoxWrapper d-flex">
                    <div className="dashboardBox position-relative justify-content-center">
                        <div className="d-flex w-100">
                            <div className="col1 text-center">
                                <h4 className="text-white">Students</h4>
                                <span className="text-white">{studentCount}</span>
                            </div>
                            <div className="ml-auto">
                                <span className="icon position-absolute">
                                    <PiStudentFill />
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="dashboardBox1 position-relative justify-content-center">
                        <div className="d-flex w-100">
                            <div className="col1 text-center">
                                <h4 className="text-white">Teachers</h4>
                                <span className="text-white">{teacherCount}</span>
                            </div>
                            <div className="ml-auto">
                                <span className="icon position-absolute">
                                    <GiTeacher />
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="dashboardBox2 position-relative justify-content-center">
                        <div className="d-flex w-100">
                            <div className="col1 text-center">
                                <h4 className="text-white">Total Users</h4>
                                <span className="text-white">{totalUsers}</span>
                            </div>
                            <div className="ml-auto">
                                <span className="icon position-absolute">
                                    <FaUserCircle />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                
            </div>
        </>
    );
};

export default Dashboard;
