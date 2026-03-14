import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'

const NavItem = ({ to, icon, label, sublabel, badge, iconBg, iconColor }) => (
  <Link
    to={to}
    className="group flex items-center gap-3.5 px-4 py-3.5 border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
  >
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
      style={{ background: iconBg, color: iconColor }}
    >
      <i className={icon} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5">
        <span className="text-[15px] font-semibold text-neutral-800">{label}</span>
        {badge > 0 && (
          <span className="text-[11px] font-bold bg-blue-600 text-white rounded-full px-1.5 py-0.5 leading-none">
            {badge}
          </span>
        )}
      </div>
      {sublabel && <p className="text-xs text-neutral-400 mt-0.5">{sublabel}</p>}
    </div>
    <i className="ri-arrow-right-s-line text-neutral-300 group-hover:text-neutral-500 group-hover:translate-x-0.5 transition-all text-lg" />
  </Link>
)

const MoreLink = () => {
  const { handleLogout } = useAuth()
  const { unreadCount } = useNotification()

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="flex items-center gap-2.5 mb-6">
      
        <h1 className="text-xl font-bold tracking-tight text-neutral-900"></h1>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden shadow-sm">
        <NavItem
          to="/notifications"
          icon="ri-notification-3-line"
          label="Notifications"
          sublabel="View recent alerts"
          badge={unreadCount}
          iconBg="#EEF4FF"
          iconColor="#4070D0"
        />
        <NavItem
          to="/complaints"
          icon="ri-feedback-line"
          label="Complaints"
          sublabel="Submit or track issues"
          iconBg="#FFF3E8"
          iconColor="#C46E20"
        />
        <NavItem
          to="/student-profile"
          icon="ri-user-line"
          label="Profile"
          sublabel="Manage your account"
          iconBg="#EDFAF3"
          iconColor="#1D8C5A"
        />

        {/* Divider */}
        <div className="h-2 bg-neutral-50" />

        <button
          onClick={handleLogout}
          className="group w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-red-50 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50 text-red-500 text-lg">
            <i className="ri-logout-box-r-line" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[15px] font-semibold text-red-500">Log out</p>
            <p className="text-xs text-neutral-400 mt-0.5">Sign out of your session</p>
          </div>
          <i className="ri-arrow-right-s-line text-red-200 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all text-lg" />
        </button>
      </div>
    </div>
  )
}

export default MoreLink