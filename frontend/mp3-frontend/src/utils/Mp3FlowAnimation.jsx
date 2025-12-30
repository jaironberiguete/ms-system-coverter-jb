import React from "react";
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

const services = ["Gateway", "RabbitMQ", "Converter", "User"];

export default function Mp3FlowAnimation() {
  const controls = useAnimation();

  useEffect(() => {
    const sequence = async () => {
      for (let i = 0; i < services.length; i++) {
        await controls.start({
          left: `${(i / (services.length - 1)) * 100}%`,
          transition: { duration: 1 },
        });
      }
    };
    sequence();
  }, [controls]);

  return (
    <div className="ml-32 mt-8 flex flex-col items-center space-y-4 w-full max-w-3xl relative">
      <h3 className="text-sm text-gray-300">MP3 Flow</h3>
      <div className="flex items-center justify-between w-full relative h-24">
        {services.map((service, index) => (
          <div key={service} className="flex flex-col items-center relative">
            <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
              {service}
            </div>
            {index < services.length - 1 && (
              <div className="absolute top-1/2 right-[-130%] w-20 h-3 bg-indigo-400" />
            )}
          </div>
        ))}

        {/* Moving dot */}
        <motion.div
          className="w-4 h-4 bg-yellow-400 rounded-full absolute top-10"
          initial={{ left: "2%" }}
          animate={controls}
        />
      </div>
    </div>
  );
}
