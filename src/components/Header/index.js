import { Link } from "react-router-dom";
import logo from '../../assets/images/logo1.jpg';
import Button from '@mui/material/Button';
import { MdMenuOpen } from "react-icons/md";
//import { MdOutlineMenu } from "react-icons/md";
import SearchBox from "../SearchBox";
import { MdOutlineLightMode } from "react-icons/md";
import { MdDarkMode } from "react-icons/md";
//import { MdLanguage } from "react-icons/md";
import { MdOutlineMailOutline } from "react-icons/md";
import { FaRegBell } from "react-icons/fa6";

const Header=()=>{
    return(
        <>
            <header className="row d-flex align-items-center">
                <div className="container-fluid w-100">
                    <div className="row d-flex align-items-center w-100">

                        {/*Logo*/}
                        <div className="col-sm-2 part1">
                            <Link to={'/'}className="d-flex align-items-center logo1">
                                <img src={logo}/>
                                <span className="ml-2">PreSchool</span>
                                {/*<Button className="rounded-circle mr-3"><MdMenuOpen/></Button>*/}
                            </Link>
                        </div>
                            {/*<div className="col-sm-3 d-flex align-items-center part2 pl-4">
                                <Button className="rounded-circle mr-3"><MdMenuOpen/></Button>
                                <SearchBox/>
                            </div>*/}

                            <div className="col-sm-9 d-flex align-items-center justify-content-end part3">
                                {/*<Button className="rounded-circle mr-3"><MdOutlineLightMode /></Button>*/}
                                {/*<Button className="rounded-circle mr-3"><MdLanguage /></Button>*/}
                                {/*<Button className="rounded-circle mr-3"><MdOutlineMailOutline /></Button>*/}
                                {/*<Button className="rounded-circle mr-3"><FaRegBell /></Button>*/}

                                <Button className="myAcc d-flex align-items-center">
                                    <div className="userImg">
                                        <span className="rounded-circle">
                                            <img src="https://img.freepik.com/free-vector/kindergarten-logo-design-template_23-2150628885.jpg?t=st=1726262633~exp=1726266233~hmac=297ad75bf70745bde22d23b7d8e8bdb343ac67d773355cffd19821a2d19b0743&w=740"/>
                                        </span>
                                    </div>
                                    <div className="userInfo">
                                        <h4>Bodiraja</h4>
                                        <p className="mb-0">@bodiraja</p>
                                    </div>

                                </Button>


                            </div>

                    </div>  
                </div>
            </header>
        </>
    )
}
export default Header;