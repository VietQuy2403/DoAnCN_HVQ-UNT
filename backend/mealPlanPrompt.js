/**
 * Tạo prompt cho Gemini AI để sinh kế hoạch ăn uống bằng tiếng Việt
 */
function createMealPlanPrompt({ goal, budget = 'medium', userNotes = '', days = 7 }) {
  // Tự động tính calories dựa trên mục tiêu
  const goalConfig = {
    weight_loss: {
      text: "giảm cân",
      calories: 1500,
      description: "Giảm cân an toàn và bền vững"
    },
    muscle_gain: {
      text: "tăng cơ",
      calories: 2500,
      description: "Tăng cơ bắp hiệu quả"
    },
    maintenance: {
      text: "duy trì cân nặng",
      calories: 2000,
      description: "Duy trì sức khỏe và cân nặng"
    }
  };

  const selectedGoal = goalConfig[goal] || goalConfig.maintenance;
  const calories = selectedGoal.calories;
  const goalText = selectedGoal.text;

  // Xử lý budget
  const budgetConfig = {
    low: {
      text: "tiết kiệm",
      description: "Dưới 100,000đ/ngày",
      guidance: "Ưu tiên nguyên liệu phổ biến, rẻ tiền như: trứng, đậu phụ, rau củ theo mùa, thịt gà, cá basa"
    },
    medium: {
      text: "trung bình",
      description: "100,000đ - 200,000đ/ngày",
      guidance: "Cân bằng giữa chất lượng và giá cả, có thể dùng thịt bò, cá hồi, hải sản thỉnh thoảng"
    },
    high: {
      text: "cao cấp",
      description: "Trên 200,000đ/ngày",
      guidance: "Tự do lựa chọn nguyên liệu chất lượng cao: thịt bò Úc, cá hồi Na Uy, hải sản tươi, rau organic"
    }
  };

  const selectedBudget = budgetConfig[budget] || budgetConfig.medium;

  // Xử lý user notes
  const notesText = userNotes.trim()
    ? `\n- Ghi chú từ người dùng: ${userNotes}`
    : "";

  const prompt = `Bạn là chuyên gia dinh dưỡng người Việt Nam. Hãy tạo một kế hoạch ăn uống ${days} ngày cho mục tiêu ${goalText}.

YÊU CẦU:
- Mục tiêu: ${selectedGoal.description}
- Tổng calo mỗi ngày: ${calories} kcal (±50 kcal)
- Ngân sách: ${selectedBudget.text} (${selectedBudget.description})
- ${selectedBudget.guidance}${notesText}
- Sử dụng món ăn Việt Nam phổ biến, dễ nấu
- Cân đối dinh dưỡng: protein, carbs, chất béo lành mạnh
- Mỗi ngày có 4 bữa: Sáng, Trưa, Tối, Snack

ĐỊNH DẠNG JSON (BẮT BUỘC):
Trả về CHÍNH XÁC theo format JSON này, KHÔNG thêm text nào khác:

{
  "days": [
    {
      "day": 1,
      "totalCalories": ${calories},
      "meals": [
        {
          "type": "Sáng",
          "time": "07:00",
          "foods": [
            {
              "name": "Phở bò",
              "portion": "1 tô",
              "calories": 350,
              "protein": 20,
              "carbs": 50,
              "fat": 8,
              "recipe": {
                "ingredients": [
                  "200g bánh phở",
                  "100g thịt bò",
                  "1 lít nước dùng xương",
                  "Hành, ngò, giá",
                  "Gia vị: muối, nước mắm, tiêu"
                ],
                "instructions": [
                  "Ninh xương bò 2-3 tiếng để có nước dùng trong",
                  "Trụng bánh phở qua nước sôi",
                  "Thái thịt bò mỏng, chần sơ",
                  "Cho bánh phở vào tô, xếp thịt bò lên trên",
                  "Chan nước dùng nóng, thêm hành ngò giá"
                ]
              }
            }
          ],
          "totalCalories": 350,
          "notes": "Ăn nhẹ nhàng, dễ tiêu"
        },
        {
          "type": "Trưa",
          "time": "12:00",
          "foods": [
            {
              "name": "Cơm gạo lứt",
              "portion": "1 chén",
              "calories": 200,
              "protein": 5,
              "carbs": 45,
              "fat": 2,
              "recipe": {
                "ingredients": [
                  "1 chén gạo lứt",
                  "1.5 chén nước",
                  "1 chút muối"
                ],
                "instructions": [
                  "Vo sạch gạo lứt",
                  "Ngâm gạo 30 phút trước khi nấu",
                  "Cho gạo, nước và muối vào nồi cơm điện",
                  "Nấu chín, để nguội 10 phút trước khi ăn"
                ]
              }
            },
            {
              "name": "Cá hồi nướng",
              "portion": "100g",
              "calories": 200,
              "protein": 25,
              "carbs": 0,
              "fat": 12,
              "recipe": {
                "ingredients": [
                  "100g phi lê cá hồi",
                  "1 muỗng cà phê dầu ô liu",
                  "Muối, tiêu, tỏi băm",
                  "Chanh"
                ],
                "instructions": [
                  "Ướp cá với muối, tiêu, tỏi băm 15 phút",
                  "Phết dầu ô liu lên mặt cá",
                  "Nướng lò 180°C trong 12-15 phút",
                  "Rưới chanh trước khi ăn"
                ]
              }
            },
            {
              "name": "Rau xào",
              "portion": "1 đĩa",
              "calories": 80,
              "protein": 3,
              "carbs": 10,
              "fat": 3,
              "recipe": {
                "ingredients": [
                  "200g rau cải ngọt",
                  "1 muỗng cà phê dầu ăn",
                  "2 tép tỏi băm",
                  "Muối, nước mắm"
                ],
                "instructions": [
                  "Rửa sạch rau, để ráo nước",
                  "Phi thơm tỏi với dầu",
                  "Cho rau vào xào nhanh tay trên lửa lớn",
                  "Nêm nếm vừa ăn, tắt bếp"
                ]
              }
            }
          ],
          "totalCalories": 480,
          "notes": "Bữa chính, đầy đủ dinh dưỡng"
        },
        {
          "type": "Tối",
          "time": "18:30",
          "foods": [
            {
              "name": "Canh chua cá",
              "portion": "1 tô",
              "calories": 150,
              "protein": 15,
              "carbs": 12,
              "fat": 5,
              "recipe": {
                "ingredients": [
                  "150g cá basa",
                  "2 quả cà chua",
                  "100g dứa",
                  "Rau ngổ, giá, me chua",
                  "Gia vị: muối, nước mắm, đường"
                ],
                "instructions": [
                  "Luộc cá sơ, bỏ xương",
                  "Nấu nước với me chua",
                  "Cho cà chua, dứa vào nấu",
                  "Thêm cá, nêm nếm vừa ăn",
                  "Cho rau ngổ, giá vào tắt bếp"
                ]
              }
            },
            {
              "name": "Cơm gạo lứt",
              "portion": "0.5 chén",
              "calories": 100,
              "protein": 2,
              "carbs": 22,
              "fat": 1,
              "recipe": {
                "ingredients": [
                  "0.5 chén gạo lứt",
                  "0.75 chén nước",
                  "1 chút muối"
                ],
                "instructions": [
                  "Vo sạch gạo lứt",
                  "Ngâm gạo 30 phút",
                  "Nấu với nồi cơm điện",
                  "Để nguội trước khi ăn"
                ]
              }
            }
          ],
          "totalCalories": 250,
          "notes": "Bữa tối nhẹ nhàng"
        },
        {
          "type": "Snack",
          "time": "15:00",
          "foods": [
            {
              "name": "Chuối",
              "portion": "1 quả",
              "calories": 100,
              "protein": 1,
              "carbs": 25,
              "fat": 0,
              "recipe": {
                "ingredients": [
                  "1 quả chuối chín"
                ],
                "instructions": [
                  "Chọn chuối chín vừa phải",
                  "Bóc vỏ và ăn trực tiếp"
                ]
              }
            },
            {
              "name": "Hạnh nhân",
              "portion": "10 hạt",
              "calories": 70,
              "protein": 3,
              "carbs": 3,
              "fat": 6,
              "recipe": {
                "ingredients": [
                  "10 hạt hạnh nhân rang"
                ],
                "instructions": [
                  "Chọn hạnh nhân rang không muối",
                  "Ăn trực tiếp hoặc kết hợp với trái cây"
                ]
              }
            }
          ],
          "totalCalories": 170,
          "notes": "Bổ sung năng lượng"
        }
      ]
    }
  ],
  "summary": {
    "goal": "${goalText}",
    "averageCalories": ${calories},
    "budget": "${selectedBudget.text}",
    "tips": [
      "Uống đủ 2-2.5 lít nước mỗi ngày",
      "Ăn chậm, nhai kỹ",
      "Tránh ăn muộn sau 20:00"
    ]
  }
}

LƯU Ý QUAN TRỌNG:
1. Chỉ trả về JSON, KHÔNG có markdown, KHÔNG có \`\`\`json
2. Đảm bảo tổng calories mỗi ngày ≈ ${calories} kcal
3. Món ăn phải là món Việt thực tế, dễ làm
4. Tạo đủ ${days} ngày với đa dạng món ăn
5. **BẮT BUỘC**: Mỗi món ăn PHẢI có trường "recipe" với:
   - "ingredients": Danh sách nguyên liệu cụ thể (khối lượng, số lượng)
   - "instructions": Các bước nấu chi tiết, dễ hiểu
6. Công thức phải thực tế, dễ làm tại nhà
7. **TUÂN THỦ NGÂN SÁCH**: ${selectedBudget.guidance}
8. **CHÚ Ý GHI CHÚ NGƯỜI DÙNG**: ${userNotes || "Không có yêu cầu đặc biệt"}

Hãy tạo kế hoạch ngay bây giờ:`;

  return prompt;
}

module.exports = { createMealPlanPrompt };
