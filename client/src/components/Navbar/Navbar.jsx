import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/auth.context";
import { BiLogOut, BiListPlus, BiListUl, BiSolidDiscount, BiSolidCategoryAlt } from 'react-icons/bi';
import { MdCampaign } from 'react-icons/md'
import { BsFillPersonFill } from 'react-icons/bs'

function Navbar() {
  const { isLoggedIn, user, logOutUser, isAdmin } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const menuItemClass = (path) =>
    `button-menu ${isActive(path) ? 'bg-sidebar-light text-white pl-10' : ''}`;

  return (
    <nav className="navbar">
      <div className="px-6 mb-4">
        <Link to="/">
          <img src={"./logo.png"} width={"180px"} className="mx-auto" alt="Restauranty" />
        </Link>
      </div>

      {user ? (
        <div className="px-6 py-3 mx-4 mb-2 bg-sidebar-light rounded-xl">
          <p className="text-yellow-400 text-xs font-medium uppercase tracking-wider mb-1">Bienvenido</p>
          <p className="text-3xl font-semibold text-sm">{user.name} {user.surname}</p>
        </div>
      ) : (
        <div className="px-6 py-3 mx-4 mb-2">
          <p className="text-slate-400 text-sm">Bienvenido a Restauranty</p>
        </div>
      )}

      <div className="buttons-main">
        {isLoggedIn && (
          <>
            {isAdmin && (
              <div className="mb-2">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest pl-8 mb-2">Nuestro menú</p>
                <Link to="/items">
                  <button className={menuItemClass('/items')}><BiListUl className="icons" />Menú</button>
                </Link>
                <Link to="/createitem">
                  <button className={menuItemClass('/createitem')}><BiListPlus className="icons" />Crea tu menú</button>
                </Link>
              </div>
            )}

            {isAdmin && (
              <div className="mb-2">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest pl-8 mb-2 mt-4">Descuentos</p>
                <Link to="/discounts/coupons">
                  <button className={menuItemClass('/discounts/coupons')}><BiSolidDiscount className="icons" />Cupones</button>
                </Link>
                <Link to="/createcoupon">
                  <button className={menuItemClass('/createcoupon')}><BiListPlus className="icons" />Obtén un cupón</button>
                </Link>
                <Link to="/discounts/campaigns">
                  <button className={menuItemClass('/discounts/campaigns')}><MdCampaign className="icons" />Ofertas</button>
                </Link>
                <Link to="/createcampaign">
                  <button className={menuItemClass('/createcampaign')}><BiListPlus className="icons" />Promociones exclusivas</button>
                </Link>
              </div>
            )}

            {isAdmin && (
              <div className="mb-2">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest pl-8 mb-2 mt-4">Categorías</p>
                <Link to="/dietary">
                  <button className={menuItemClass('/dietary')}><BiSolidCategoryAlt className="icons" />Categorías</button>
                </Link>
                <Link to="/createdietary">
                  <button className={menuItemClass('/createdietary')}><BiListPlus className="icons" />Crea tu menú por categoría</button>
                </Link>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-sidebar-light">
              <Link to="/profile">
                <button className={menuItemClass('/profile')}><BsFillPersonFill className="icons" />Perfil</button>
              </Link>
              <button onClick={logOutUser} className="button-menu text-red-400 hover:text-red-300 hover:bg-red-500/10">
                <BiLogOut className="icons text-red-400" />Cerrar sesión
              </button>
            </div>
          </>
        )}
      </div>

      {!isLoggedIn && (
        <div className="mt-6 px-6 space-y-2">
          <Link to="/login">
            <button className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-all duration-200 shadow-sm">
              Sesión
            </button>
          </Link>
          <Link to="/signup">
            <button className="w-full py-3 bg-transparent text-slate-300 border border-slate-500 rounded-xl font-semibold text-sm hover:bg-sidebar-light hover:text-white transition-all duration-200 mt-2">
              Registro
            </button>
          </Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
