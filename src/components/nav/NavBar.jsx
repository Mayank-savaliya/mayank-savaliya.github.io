import React, { useCallback, useState } from "react";
import { AiOutlineHome } from "react-icons/ai";
import { AiOutlineUser } from "react-icons/ai";
import { BiBook } from "react-icons/bi";
import { RiServiceLine } from "react-icons/ri";
import { BiMessageSquareDetail } from "react-icons/bi";

export const NavBar = () => {
    const [activeNav, setActiveNav] = useState("#");
    const activeNavSwitch = useCallback((value) => {
        setActiveNav(value);
    }, []);
    return (
        <nav>
            <a href="#" className={activeNav == "#" ? "active" : ""} onClick={() => activeNavSwitch("#")}>
                <AiOutlineHome />
            </a>
            <a href="#about" className={activeNav == "#about" ? "active" : ""} onClick={() => activeNavSwitch("#about")}>
                <AiOutlineUser />
            </a>
            <a href="#experience" className={activeNav == "#experience" ? "active" : ""} onClick={() => activeNavSwitch("#experience")}>
                <BiBook />
            </a>
            <a href="#services" className={activeNav == "#services" ? "active" : ""} onClick={() => activeNavSwitch("#services")}>
                <RiServiceLine />
            </a>
            <a href="#contact" className={activeNav == "#contacet" ? "active" : ""} onClick={() => activeNavSwitch("#contact")}>
                <BiMessageSquareDetail />
            </a>
        </nav>
    );
};
