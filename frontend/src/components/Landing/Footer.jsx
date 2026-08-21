import React from "react";
import Icon from "../common/Icon";

export default function Footer() {
  return (
    <footer id="contact" className="bg-primary text-white pt-12">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-white/10">
        {/* Logo */}
        <div className="space-y-4">
          <img
            alt="GoI Grievance Portal Logo"
            className="h-12 w-auto brightness-0 invert opacity-90"
            src="https://lh3.googleusercontent.com/aida/AP1WRLs0O2MXUB_U1ZbXDzIyF0Pquo0pRWf3XQUJTj-gX0pYGuz9SQxBvNnx9jq5FvH46BlW-VVqwjCZKjitlH1D3M-Nppt59g0dip1xPo2q5tZZOQXNQJQwe4XJEdOvTz5j1t57ZzClV1kq8pJAFqLgVWMYXIdQLVCOQ1agjynsbuK3bAorTKEA_zczRIgmNbYg-pc4tS0elfHswCPh4XpdNaY-LZahktOdiWZIbMipwq2FWYQg-kvPhEGZmp4"
          />

          <p className="text-xs opacity-70 leading-relaxed">
            Official Public Grievance Portal, Department of Administrative
            Reforms & Public Grievances (DARPG), Government of India.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xl font-semibold mb-6 text-blue-200">
            Quick Links
          </h4>

          <ul className="space-y-4 text-sm opacity-80">
            <li>
              <a href="#complaint" className="footer-link">
                File a Grievance
              </a>
            </li>
            <li>
              <a href="#track" className="footer-link">
                Track Status
              </a>
            </li>
            <li>
              <a href="#dashboard" className="footer-link">
                View Dashboard
              </a>
            </li>
            <li>
              <a href="#officers" className="footer-link">
                Nodal Officers List
              </a>
            </li>
          </ul>
        </div>

        {/* Information */}
        <div>
          <h4 className="text-xl font-semibold mb-6 text-blue-200">
            Information
          </h4>

          <ul className="space-y-4 text-sm opacity-80">
            <li>
              <a href="#rti" className="footer-link">
                RTI Portal
              </a>
            </li>
            <li>
              <a href="#privacy" className="footer-link">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#terms" className="footer-link">
                Terms & Conditions
              </a>
            </li>
            <li>
              <a href="#copyright" className="footer-link">
                Copyright Policy
              </a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-xl font-semibold mb-6 text-blue-200">
            Connect With Us
          </h4>

          <div className="flex gap-4 mb-6">
            <a href="#twitter" className="social-button">
              <Icon>public</Icon>
            </a>

            <a href="#linkedin" className="social-button">
              <Icon>business</Icon>
            </a>
          </div>

          <p className="text-xs opacity-60">
            Help Desk: 1800-11-4424
            <br />
            Email: support-cpgrams@gov.in
          </p>
        </div>
      </div>

      {/* Bottom footer */}
      <div className="w-full px-8 py-8 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-sm opacity-80 text-center md:text-left">
          © 2024 Department of Administrative Reforms & Public Grievances
          (DARPG). All rights reserved.
        </p>

        <div className="flex items-center gap-8">
          <img
            alt="Digital India Logo"
            className="h-8 w-auto brightness-0 invert"
            src="https://lh3.googleusercontent.com/aida/AP1WRLvtvZkuBna0i50eymX2KGCtCg9Q1NrOwB96rbxBiSu0BoV3KiEpkUKRTyaQYq9IG2PIP8E4LM-5UEpAq6kG1D4oB9nPk0pqLlOTRCKh4Xuc5J0QbhuxHZAkJfdD_Wu7lr1MtY_YIQmOoTalIeZN6jWuvSaf864s0stAeuqH3qOlNIypUxiMtjsgIv4eNJD_s1jc-pOvAgUYm2PQpoCeZ67pNDgoMx1NOlNeSgG8Feq4RB7NMgJSmdW-gHTQ"
          />

          <span className="text-xs opacity-80">
            Last Updated: Oct 2024
          </span>
        </div>
      </div>
    </footer>
  );
}
