import React, { useEffect, useState } from 'react';
import { ReduxState } from '@redux/reducers';
import { useSelector } from 'react-redux';
import { Button, Menu, Dropdown } from 'antd';
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
import Link from 'next/link';

import { BillingPlan, Package } from '@type/Packages';
import { CartItem } from '@type/Cart';

import styles from './CartDrawer.module.css';
import { CloseIcon } from './SvgIcons';

function PlanDropdown({
  pack,
  selectedPlan,
  changePlan
}: {
  pack: Package;
  selectedPlan: BillingPlan;
  changePlan: (plan: BillingPlan) => void;
}) {
  const [packTypeMenuOpen, setPackTypeMenuOpen] = useState<boolean>(false);
  const [tempPlan, setTempPlan] = useState<BillingPlan>(selectedPlan);

  const billingPlans = pack.billing_plans.filter((plan) => plan.description !== 'add-on');

  const PackTypeMenu = () => (
    <Menu className={styles.sportMenu}>
      {billingPlans.map((plan: BillingPlan, index: number) => (
        <Menu.Item
          key={index}
          className={styles.sportMenuItem}
          onClick={() => {
            setPackTypeMenuOpen(false);
            setTempPlan(plan);
            changePlan(plan);
          }}>
          {`${plan.name}`}
        </Menu.Item>
      ))}
    </Menu>
  );

  const changePackMenuVisible = (status: boolean) => {
    setPackTypeMenuOpen(status);
  };

  return (
    <Dropdown
      overlay={PackTypeMenu}
      onVisibleChange={changePackMenuVisible}
      placement="bottomLeft"
      transitionName=""
      trigger={['click']}>
      <div className={styles.optionBtn}>
        <span>{tempPlan?.name}</span>
        {packTypeMenuOpen && <CaretUpOutlined className={styles.caret_up} />}
        {!packTypeMenuOpen && <CaretDownOutlined className={styles.caret_down} />}
      </div>
    </Dropdown>
  );
}

type CartDrawerProps = {
  packages: Package[];
  open: boolean;
  onClose: () => void;
};

export default function CartDrawer({ packages, open, onClose }: CartDrawerProps) {
  const { items: cartItems } = useSelector((state: ReduxState) => state.cart);
  const [tempCartItems, setTempCartItems] = useState<CartItem[]>([]);
  const [cartClicked, setCartClicked] = useState<boolean>(false);

  useEffect(() => {
    setTempCartItems(cartItems);
  }, [cartItems]);

  const removeCartAt = (index: number) => {
    const updated = tempCartItems.slice();
    updated.splice(index, 1);
    setTempCartItems(updated);
  };
  const changedPlan = (index: number, plan: BillingPlan) => {
    const updated = tempCartItems.slice();
    updated[index].plan = plan;
    setTempCartItems(updated);
  };

  return (
    <>
      {open && <div className={styles.cartDrawerWrapper} onClick={onClose}></div>}
      <div className={`${open && styles.open} ${styles.cartDrawer}`}>
        <div className={styles.cartItems}>
          <div className={styles.cartItemsMain}>
            {tempCartItems.length === 0 && (
              <p className={styles.noItem}>
                <em>Cart is empty</em>
              </p>
            )}
            {tempCartItems.map((item, index) => (
              <div key={index} className={styles.cartItem}>
                <div className={styles.cartItemMain}>
                  <img
                    src={item.sports?.logo || 'https://via.placeholder.com/100'}
                    alt={item.sports?.name}
                  />
                  <div className={styles.cartItemInfo}>
                    <span className={styles.cartItemName}>{item.pack.name}</span>
                    <span className={styles.cartItemDesc}>
                      {item.pack.name.indexOf('VIP All Access') > -1
                        ? 'All Sports'
                        : item.sports?.name}
                    </span>
                  </div>
                </div>
                <div className={styles.cartItemPlans}>
                  <div className={styles.cartItemPlansContent}>
                    {packages?.map((pack, idx: number) => (
                      <React.Fragment key={idx}>
                        {pack.id === item.plan.package && pack.description !== 'add-on' && (
                          <PlanDropdown
                            pack={pack}
                            selectedPlan={item.plan}
                            changePlan={(plan) => changedPlan(index, plan)}
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                <div className={styles.cartItemPrice}>{`$${item.plan.price}.00`}</div>
                <Button
                  type={'link'}
                  className={styles.removeCartItemBtn}
                  icon={<CloseIcon className={styles.closeIcon} />}
                  onClick={() => removeCartAt(index)}></Button>
              </div>
            ))}
          </div>
          {tempCartItems.length !== 0 && (
            <div className={styles.goToCartRow}>
              <Link href="/cart">
                <Button
                  loading={cartClicked}
                  className={styles.goToCartBtn}
                  onClick={() => setCartClicked(true)}>
                  Go to Cart
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
