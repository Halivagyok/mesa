import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHouseChimney, FaBars, FaXmark, FaRegNoteSticky } from 'react-icons/fa6';
import { Resizable } from 're-resizable';
import { useAuth } from '../contexts/AuthContext';
import UserMenu from './UserMenu';
import ChatList from './ChatList';

const Button = ({ text, to }) => {
  const navigate = useNavigate();
  return (
    <button className="flex text-2xl items-start" onClick={() => navigate(to)}>
      {text}
    </button>
  );
};

const SidebarContent = ({ currentUser, isMobile, setIsOpen }) => (
  <div className="flex flex-col h-full justify-between py-4 px-4 bg-black/60 text-white">
    <div className="">
      <div className="flex gap-2 justify-between">
        <Button text={<FaHouseChimney />} to="/" />
        {currentUser && <Button text={<FaRegNoteSticky />} to="/notepad" />}
      </div>
      <div className="mt-4 overflow-y-auto">
          {currentUser && (
            <>
              <ChatList onChatSelect={() => isMobile && setIsOpen(false)} />
            </>
          )}
        </div>
    </div>
    <div className="flex flex-col gap-4">
      {currentUser ? <UserMenu /> : null}
    </div>
  </div> 
);

export function Navigation() {
  const { currentUser } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isOpen, setIsOpen] = useState(!isMobile);
  const [width, setWidth] = useState(250);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(true);
      } else {
        setIsOpen(false)
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  if (isMobile) {
    return (
      <>
        <button onClick={toggleSidebar} className={`fixed top-4 left-4 z-20 ${isOpen ? 'text-white' : 'text-black dark:text-white'}`}>
          {isOpen ? <FaXmark size={24} /> : <FaBars size={24} />}
        </button>
        {isOpen && (
          <div className="fixed inset-0 z-10 bg-black/80">
            <SidebarContent currentUser={currentUser} isMobile={isMobile} setIsOpen={setIsOpen} />
          </div>
        )}
      </>
    );
  }

  return (
    <Resizable
      size={{ width, height: '100vh' }}
      onResizeStop={(e, direction, ref, d) => {
        setWidth(width + d.width);
      }}
      minWidth={225}
      maxWidth={500}
      enable={{ right: true }}
    >
      <SidebarContent currentUser={currentUser} isMobile={isMobile} setIsOpen={setIsOpen} />
    </Resizable>
  );
}

