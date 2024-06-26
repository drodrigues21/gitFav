export class GithubUser {
   static search(username) {
      const endpoint = `https://api.github.com/users/${username}`;

      return fetch(endpoint)
         .then((response) => response.json())
         .then(({ login, name, public_repos, followers }) => ({
            login,
            name,
            public_repos,
            followers,
         }))
         .catch((error) => {
            console.log(error);
         });
   }
}

// Class to contain the data logic
export class Favorites {
   constructor(root) {
      this.root = document.querySelector(root);
      this.load();

      GithubUser.search("maykbrito").then((user) => console.log(user));
   }

   load() {
      this.entries =
         JSON.parse(localStorage.getItem("@github-favorites:")) || [];
   }

   save() {
      localStorage.setItem("@github-favorites:", JSON.stringify(this.entries));
   }

   async add(username) {
      try {
         const userExists = this.entries.find(
            (entry) => entry.login === username
         );

         if (userExists) {
            throw new Error("Usuário já cadastrado");
         }

         const user = await GithubUser.search(username);

         if (user.login === undefined) {
            throw new Error("Usuário não encontrado!");
         }

         this.entries = [user, ...this.entries];
         this.update();
         this.save();
      } catch (error) {
         alert(error.message);
      }
   }

   delete(user) {
      const filteredEntries = this.entries.filter((entry) => {
         return entry.login !== user.login;
      });

      this.entries = filteredEntries;
      this.update();
      this.save();
   }
}

// Class to create the HTML elements and events
export class FavoriteView extends Favorites {
   constructor(root) {
      super(root);
      this.tbody = this.root.querySelector("table tbody");
      this.update();
      this.onAdd();
   }

   onAdd() {
      const addBtn = document.querySelector(".search button");
      addBtn.addEventListener("click", () => {
         const { value } = this.root.querySelector(".search input");

         this.add(value);
      });
   }
   update() {
      this.romveAllTr();

      this.entries.forEach((user) => {
         const row = this.createRow();

         row.querySelector(
            ".user img"
         ).src = `https://github.com/${user.login}.png`;
         row.querySelector(".user img").alt = `Imagem de ${user.name}`;
         row.querySelector(".user a").href = `https://github.com/${user.login}`;
         row.querySelector(".user p").textContent = user.name;
         row.querySelector(".user span").textContent = user.login;
         row.querySelector(".repositories").textContent = user.public_repos;
         row.querySelector(".followers").textContent = user.followers;

         row.querySelector(".remove").addEventListener("click", () => {
            const isOk = confirm("Are you sure you want to remove?");

            if (isOk) {
               this.delete(user);
            }
         });

         this.tbody.append(row);
      });
   }

   createRow() {
      const tr = document.createElement("tr");

      const content = `
      <td class="user">
        <img src="https://github.com/maykbrito.png" alt="Imagem de maykbrito">
        <a href="https://github.com/maykbrito" target="_blank">
          <p>Mayk Brito</p>
          <span>maykbrito</span>
        </a>
      </td>
      <td class="repositories">
        76
      </td>
      <td class="followers">
        9589
      </td>
      <td>
        <button class="remove">&times;</button>
      </td>
    `;

      tr.innerHTML = content;

      return tr;
   }

   romveAllTr() {
      this.tbody.querySelectorAll("tr").forEach((tr) => {
         tr.remove();
      });
   }
}
