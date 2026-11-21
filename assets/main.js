/*
 * 화면 그리기 + 문의 양식 보내기
 * 글자는 content.js 에서, Supabase 연결 정보는 config.js 에서 가져옵니다.
 */
(function () {
  "use strict";

  var C = window.SITE_CONTENT || {};

  // "hero.headline" 같은 경로로 content.js 값을 꺼냅니다
  function get(path) {
    return path.split(".").reduce(function (o, k) { return o == null ? o : o[k]; }, C);
  }

  // 줄바꿈(\n)은 <br>로 바꿔서 안전하게 넣습니다
  function setText(el, value) {
    el.textContent = "";
    String(value == null ? "" : value).split("\n").forEach(function (line, i) {
      if (i > 0) el.appendChild(document.createElement("br"));
      el.appendChild(document.createTextNode(line));
    });
  }

  function make(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) setText(el, text);
    return el;
  }

  // ── 글자 채우기 ─────────────────────────────
  document.querySelectorAll("[data-text]").forEach(function (el) {
    setText(el, get(el.getAttribute("data-text")));
  });
  document.querySelectorAll("[data-list]").forEach(function (el) {
    (get(el.getAttribute("data-list")) || []).forEach(function (item) {
      el.appendChild(make("li", null, item));
    });
  });
  document.querySelectorAll("[data-email]").forEach(function (el) {
    var email = get(el.getAttribute("data-email")) || "";
    el.textContent = email;
    el.href = "mailto:" + email;
  });
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
  if (C.siteTitle && document.body.className.indexOf("thanks-page") === -1) document.title = C.siteTitle;
  if (C.siteDescription) {
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", C.siteDescription);
  }

  // 프로그램 카드
  var cards = document.getElementById("program-cards");
  if (cards && C.programs) {
    C.programs.items.forEach(function (p) {
      var card = make("article", "card");
      card.appendChild(make("h3", null, p.name));
      var dl = make("dl");
      [["대상", p.target], ["진행 방식", p.format], ["기대 효과", p.outcome]].forEach(function (row) {
        var div = make("div");
        div.appendChild(make("dt", null, row[0]));
        div.appendChild(make("dd", null, row[1]));
        dl.appendChild(div);
      });
      card.appendChild(dl);
      cards.appendChild(card);
    });
  }

  // ── 문의 양식 ───────────────────────────────
  var form = document.getElementById("inquiry-form");
  if (!form) return;

  var options = document.getElementById("program-options");
  (get("inquiry.programOptions") || []).forEach(function (name) {
    var label = make("label", "radio");
    var input = document.createElement("input");
    input.type = "radio";
    input.name = "program";
    input.value = name;
    label.appendChild(input);
    label.appendChild(make("span", null, name));
    options.appendChild(label);
  });
  var msg = document.getElementById("f-message");
  if (msg) msg.placeholder = get("inquiry.messagePlaceholder") || "";

  var errorBox = document.getElementById("form-error");
  var submitBtn = document.getElementById("submit-btn");

  function showError(text) {
    errorBox.textContent = text;
    errorBox.hidden = false;
  }

  function mark(el, bad) {
    if (el) el.classList.toggle("invalid", bad);
  }

  function readForm() {
    var fd = new FormData(form);
    return {
      company: String(fd.get("company") || "").trim(),
      name: String(fd.get("name") || "").trim(),
      contact: String(fd.get("contact") || "").trim(),
      program: String(fd.get("program") || ""),
      message: String(fd.get("message") || "").trim(),
      consent: document.getElementById("f-consent").checked,
      website: String(fd.get("website") || ""),
    };
  }

  function validate(d) {
    var problems = [];
    var checks = [
      ["f-company", d.company, "회사명"],
      ["f-name", d.name, "담당자 이름"],
      ["f-contact", d.contact, "연락처"],
    ];
    checks.forEach(function (c) {
      var field = document.getElementById(c[0]).closest(".field");
      mark(field, !c[1]);
      if (!c[1]) problems.push(c[2]);
    });

    // 연락처는 이메일 형식이거나, 숫자가 8자리 이상 있으면 전화번호로 봅니다
    if (d.contact) {
      var isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.contact);
      var isPhone = (d.contact.match(/\d/g) || []).length >= 8 && /^[\d\s\-+().]+$/.test(d.contact);
      if (!isEmail && !isPhone) {
        mark(document.getElementById("f-contact").closest(".field"), true);
        return "연락처는 이메일 주소나 전화번호로 적어주세요.";
      }
    }

    mark(options.closest(".field"), !d.program);
    if (!d.program) problems.push("관심 프로그램");

    mark(form.querySelector(".consent"), !d.consent);

    if (problems.length) return problems.join(", ") + "을(를) 입력해주세요.";
    if (!d.consent) return "개인정보 수집·이용에 동의해주셔야 문의를 보낼 수 있습니다.";
    return "";
  }

  form.addEventListener("input", function (e) {
    var field = e.target.closest(".field, .consent");
    if (field) field.classList.remove("invalid");
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errorBox.hidden = true;

    var d = readForm();
    var problem = validate(d);
    if (problem) {
      showError(problem);
      var firstBad = form.querySelector(".invalid input, .invalid textarea, .invalid");
      if (firstBad && firstBad.focus) firstBad.focus();
      return;
    }

    // 숨은 칸이 채워졌으면 사람이 아니라 스팸 로봇입니다. 저장하지 않고 완료 화면만 보여줍니다
    if (d.website) {
      window.location.href = "thanks.html";
      return;
    }

    var cfg = window.SUPABASE_CONFIG || {};
    var email = get("contactEmail") || "";
    if (!cfg.url || !cfg.key) {
      showError("지금은 문의 접수가 준비 중입니다. " + email + " 로 메일 주시면 바로 확인하겠습니다.");
      console.warn("[문의 양식] assets/config.js 에 Supabase url과 key를 넣어주세요.");
      return;
    }

    submitBtn.disabled = true;
    var originalText = submitBtn.textContent;
    submitBtn.textContent = "보내는 중…";

    fetch(cfg.url.replace(/\/+$/, "") + "/rest/v1/inquiries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: cfg.key,
        // 방문자는 문의를 넣기만 하고 읽을 수는 없으므로, 저장 결과를 돌려받지 않습니다
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        company: d.company,
        name: d.name,
        contact: d.contact,
        program: d.program,
        message: d.message || null,
        consent: true,
      }),
    })
      .then(function (res) {
        if (!res.ok) {
          return res.text().then(function (t) { throw new Error(res.status + " " + t); });
        }
        window.location.href = "thanks.html";
      })
      .catch(function (err) {
        console.error("[문의 양식] 저장 실패:", err);
        showError("문의를 보내지 못했습니다. 잠시 후 다시 시도하시거나 " + email + " 로 메일 주세요.");
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      });
  });
})();
