const grade9Data = [
  { grade: "1등급", percentage: 4 },
  { grade: "2등급", percentage: 7 },
  { grade: "3등급", percentage: 12 },
  { grade: "4등급", percentage: 17 },
  { grade: "5등급", percentage: 20 },
  { grade: "6등급", percentage: 17 },
  { grade: "7등급", percentage: 12 },
  { grade: "8등급", percentage: 7 },
  { grade: "9등급", percentage: 4 },
]

const grade5Data = [
  { grade: "1등급", percentage: 10 },
  { grade: "2등급", percentage: 24 },
  { grade: "3등급", percentage: 32 },
  { grade: "4등급", percentage: 24 },
  { grade: "5등급", percentage: 10 },
]

let currentGradeSystem = "9grade"
let currentValidValue = 100

function getCurrentGradeData() {
  return currentGradeSystem === "9grade" ? grade9Data : grade5Data
}

function getGradeClass(grade) {
  const gradeNumber = grade.charAt(0)
  return `grade-${gradeNumber}`
}

function switchTab(tabName) {
  document.querySelectorAll(".tab-button").forEach((btn) => {
    btn.classList.remove("active")
  })
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active")

  currentGradeSystem = tabName

  const systemText = tabName === "9grade" ? "9등급제" : "5등급제"
  document.getElementById("gradeSystemText").textContent = systemText

  calculateGrades()
}

function validateInput(value) {
  const trimmedValue = value.trim()

  if (trimmedValue === "") {
    return { isValid: true, value: 0, isEmpty: true }
  }

  if (isNaN(trimmedValue)) {
    return {
      isValid: false,
      message: "숫자만 입력해 주세요.",
      shouldShowMessage: true,
    }
  }

  const numValue = Number.parseFloat(trimmedValue)

  if (numValue % 1 !== 0) {
    const lowerInt = Math.floor(numValue)
    const upperInt = Math.ceil(numValue)
    return {
      isValid: false,
      message: `유효한 값을 입력해 주세요. 가장 근접한 유효 한 2개는 ${lowerInt} 및 ${upperInt}입니다.`,
      shouldShowMessage: true,
    }
  }

  if (numValue < 0) {
    return {
      isValid: false,
      message: "0 이상의 값을 입력해 주세요.",
      shouldShowMessage: true,
    }
  }

  if (numValue > 10000) {
    return {
      isValid: false,
      message: "10,000 이하의 값을 입력해 주세요.",
      shouldShowMessage: true,
    }
  }

  return { isValid: true, value: Number.parseInt(numValue) }
}

function showValidationMessage(message, show = true) {
  const messageElement = document.getElementById("validationMessage")
  const textElement = messageElement.querySelector(".validation-text")
  const inputField = document.getElementById("totalStudents")

  if (show && message) {
    textElement.textContent = message
    messageElement.classList.remove("hidden")
    inputField.classList.add("error")
  } else {
    messageElement.classList.add("hidden")
    inputField.classList.remove("error")
  }
}

function calculateGrade9Students(totalStudents) {
  const gradeData = getCurrentGradeData()

  const students = gradeData.map((item) => Math.round((totalStudents * item.percentage) / 100))

  const totalCalculated = students.reduce((sum, count) => sum + count, 0)
  let difference = totalStudents - totalCalculated

  if (difference !== 0) {
    if (difference > 0) {
      const adjustOrder = [4, 3, 5, 2, 6, 1, 7, 0, 8]
      for (let i = 0; i < adjustOrder.length && difference > 0; i++) {
        students[adjustOrder[i]]++
        difference--
      }
    } else {
      const adjustOrder = [8, 7, 6, 5, 3, 2, 1, 0, 4]
      for (let i = 0; i < adjustOrder.length && difference < 0; i++) {
        if (students[adjustOrder[i]] > 0) {
          students[adjustOrder[i]]--
          difference++
        }
      }
    }
  }

  return students
}

function calculateGrade5Students(totalStudents) {
  const gradeData = getCurrentGradeData()

  const students = gradeData.map((item) => Math.round((totalStudents * item.percentage) / 100))

  const totalCalculated = students.reduce((sum, count) => sum + count, 0)
  let difference = totalStudents - totalCalculated

  if (difference !== 0) {
    if (difference > 0) {
      const adjustOrder = [2, 1, 3, 0, 4]
      for (let i = 0; i < adjustOrder.length && difference > 0; i++) {
        students[adjustOrder[i]]++
        difference--
      }
    } else {
      const adjustOrder = [4, 0, 3, 1, 2]
      for (let i = 0; i < adjustOrder.length && difference < 0; i++) {
        if (students[adjustOrder[i]] > 0) {
          students[adjustOrder[i]]--
          difference++
        }
      }
    }
  }

  return students
}

function calculateGradeStudents(totalStudents) {
  if (currentGradeSystem === "9grade") {
    return calculateGrade9Students(totalStudents)
  } else {
    return calculateGrade5Students(totalStudents)
  }
}

function calculateRankRanges(totalStudents, studentCounts) {
  const rankRanges = []
  let currentRank = 1

  for (let i = 0; i < studentCounts.length; i++) {
    const students = studentCounts[i]

    if (students === 0) {
      rankRanges.push(`해당 없음`)
    } else if (students === 1) {
      rankRanges.push(`${currentRank}등`)
    } else {
      const endRank = currentRank + students - 1
      rankRanges.push(`${currentRank} ~ ${endRank}등 까지`)
    }

    currentRank += students
  }

  return rankRanges
}

function updateCalculationsWithValue(totalStudents) {
  document.getElementById("totalCount").textContent = totalStudents

  const studentCounts = calculateGradeStudents(totalStudents)
  const gradeData = getCurrentGradeData()
  const calculatedData = gradeData.map((item, index) => ({
    ...item,
    students: studentCounts[index],
  }))

  const rankRanges = calculateRankRanges(totalStudents, studentCounts)

  const dataWithRanks = calculatedData.map((item, index) => ({
    ...item,
    rankRange: rankRanges[index],
  }))

  updateMobileCards(dataWithRanks)

  updateDesktopTable(dataWithRanks)
}

function calculateGrades() {
  const inputValue = document.getElementById("totalStudents").value
  const validation = validateInput(inputValue)

  if (!validation.isValid) {
    showValidationMessage(validation.message, validation.shouldShowMessage)

    if (validation.shouldShowMessage) {
      updateCalculationsWithValue(currentValidValue)
      return
    }
  } else {
    currentValidValue = validation.value
    showValidationMessage("", false)

    if (validation.isEmpty) {
      document.getElementById("totalStudents").value = ""
    }

    updateCalculationsWithValue(validation.value)
  }
}

function updateMobileCards(data) {
  const mobileCards = document.getElementById("mobileCards")
  mobileCards.innerHTML = data
    .map(
      (item) => `
        <div class="mobile-card">
            <div class="mobile-card-header">
                <span class="badge ${getGradeClass(item.grade)}">${item.grade}</span>
                <span class="student-count">${item.students}명</span>
            </div>
            <div class="mobile-card-details">
                <div>비율: ${item.percentage}%</div>
                <div>등수: ${item.rankRange}</div>
            </div>
        </div>
    `,
    )
    .join("")
}

function updateDesktopTable(data) {
  const desktopTableBody = document.getElementById("desktopTableBody")
  desktopTableBody.innerHTML = data
    .map(
      (item) => `
        <tr>
            <td><span class="badge ${getGradeClass(item.grade)}">${item.grade}</span></td>
            <td>${item.percentage}%</td>
            <td>${item.students}</td>
            <td>${item.rankRange}</td>
        </tr>
    `,
    )
    .join("")
}

async function saveAsImage() {
  const saveButton = document.getElementById("saveImageBtn")
  const originalText = saveButton.innerHTML

  saveButton.innerHTML = `
        <svg class="icon animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        저장 중...
    `
  saveButton.disabled = true

  try {
    const resultsCard = document.getElementById("resultsCard")
    const systemText = currentGradeSystem === "9grade" ? "9등급제" : "5등급제"

    const html2canvas = window.html2canvas
    const canvas = await html2canvas(resultsCard, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      allowTaint: true,
      width: resultsCard.offsetWidth,
      height: resultsCard.offsetHeight,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
    })

    const link = document.createElement("a")
    link.download = `등급컷_계산기_${systemText}_${currentValidValue}명_${new Date().toISOString().slice(0, 10)}.png`
    link.href = canvas.toDataURL("image/png")

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showNotification("이미지가 성공적으로 저장되었습니다!", "success")
  } catch (error) {
    console.error("이미지 저장 중 오류 발생:", error)
    showNotification("이미지 저장 중 오류가 발생했습니다.", "error")
  } finally {
    saveButton.innerHTML = originalText
    saveButton.disabled = false
  }
}

function showNotification(message, type = "info") {
  const existingNotification = document.querySelector(".notification")
  if (existingNotification) {
    existingNotification.remove()
  }

  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === "success" ? "#10b981" : "#ef4444"};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        font-size: 14px;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
    `

  notification.textContent = message
  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-in"
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove()
      }
    }, 300)
  }, 3000)
}

function initializePage() {
  document.getElementById("totalStudents").value = "100"
  currentValidValue = 100
  calculateGrades()

  const headerContent = document.querySelector(".header-content")
  if (headerContent) {
    headerContent.addEventListener("click", () => {
      if (currentGradeSystem !== "9grade") {
        switchTab("9grade")
      }

      document.getElementById("totalStudents").value = "100"
      currentValidValue = 100
      calculateGrades()
    })

    headerContent.style.cursor = "pointer"
  }

  const inputField = document.getElementById("totalStudents")

  inputField.addEventListener("input", calculateGrades)

  inputField.addEventListener("focus", function () {
    this.select()
  })

  inputField.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      this.blur()
    }
  })

  inputField.addEventListener("blur", function () {
    const validation = validateInput(this.value)
    if (!validation.isValid && validation.shouldShowMessage) {
      this.value = currentValidValue
      showValidationMessage("", false)
    }
  })

  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", function () {
      const tabName = this.getAttribute("data-tab")
      switchTab(tabName)
    })
  })

  const saveButton = document.getElementById("saveImageBtn")
  if (saveButton) {
    saveButton.addEventListener("click", saveAsImage)
  }
}

document.addEventListener("DOMContentLoaded", initializePage)

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    calculateGrades()
  }
})