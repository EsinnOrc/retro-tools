import React from "react";
import { Row, Col } from "antd";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";
import styles from "./index.module.scss";
import Buttons from "@/components/atoms/buttons/button";

const Footer = () => {
  return (
    <div>
      <div className={styles.blueBar}></div>
      <div className={styles.footer}>
        <Row gutter={[16, 16]} className={styles.row}>
          <Col xs={24} md={6} className={styles.col}>
            <div className={styles.logoSection}>
              <div className={styles.logoContainer}>
                <span className={styles.logo}>Retro</span>
                <span className={styles.logo}>spect</span>
              </div>
              <p>
                Reetro is a retrospective tool that is pioneering the tiny
                interactions that drive long term improvement and success.
              </p>
              <Buttons
                htmlType="button"
                className={styles.button}
                text="Get Started"
              />
            </div>
          </Col>
          <Col xs={24} md={6} className={styles.col}>
            <h3>Company</h3>
            <ul>
              <li>
                <a href="#">About</a>
              </li>
              <li>
                <a href="#">Smart Boards</a>
              </li>
              <li>
                <a href="#">Action Tracker</a>
              </li>
              <li>
                <a href="#">Integrations</a>
              </li>
              <li>
                <a href="#">Funretro Alternative</a>
              </li>
              <li>
                <a href="#">Reetro Brochure</a>
              </li>
            </ul>
          </Col>
          <Col xs={24} md={6} className={styles.col}>
            <h3>Useful Links</h3>
            <ul>
              <li>
                <a href="#">Security</a>
              </li>
              <li>
                <a href="#">Privacy Policy</a>
              </li>
              <li>
                <a href="#">GDPR Compliance</a>
              </li>
              <li>
                <a href="#">Terms & Conditions</a>
              </li>
              <li>
                <a href="#">Retrospective guide</a>
              </li>
              <li>
                <a href="#">System status</a>
              </li>
            </ul>
          </Col>
          <Col xs={24} md={6} className={styles.col}>
            <h3>Contact Info</h3>
            <p>Get in touch with us</p>
            <p>
              <FaMapMarkerAlt /> Copenhagen, Denmark.
            </p>
            <p>
              <FaPhoneAlt /> + (45) 31821137
            </p>
            <p>
              <FaEnvelope /> hello@reetro.io
            </p>
            <div className={styles.socialIcons}>
              <FaFacebookF />
              <FaTwitter />
              <FaLinkedinIn />
            </div>
          </Col>
        </Row>
        <Row className={styles.footerBottom}>
          <Col span={24}>
            <p>© 2024 Reetro | Forever Free Retrospective Tool</p>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Footer;
